import axios from 'axios'

/**
 * Client for our own /api/jrb/* proxy routes.
 *
 * validateStatus is disabled on purpose: the JRB State API uses 202, 400 and
 * 404 to carry meaningful payloads, so a non-2xx is a result to render, not a
 * throw. Only genuine transport failures reject.
 */
const client = axios.create({
  baseURL: '/api/jrb',
  headers: { Accept: 'application/json' },
  validateStatus: () => true,
})

function handle(response) {
  // The session token is gone — the backend has already logged us out.
  if (response.status === 401) {
    window.location.href = '/'
    return { status: 401, body: null }
  }

  return { status: response.status, body: response.data }
}

export async function getLookup(path) {
  try {
    return handle(await client.get(path))
  } catch (error) {
    return { status: 0, body: { message: error.message } }
  }
}

export async function postJrb(path, payload) {
  try {
    return handle(await client.post(path, payload))
  } catch (error) {
    return { status: 0, body: { message: error.message } }
  }
}

/* -------------------------------------------------------------------------
 | Response interpretation
 |
 | Maps everything we can receive onto one shape the UI can render:
 |   { tone, title, message, details[], data, next }
 |
 | Sources, in order of specificity:
 |   - 0            transport failure (we never reached the server)
 |   - 422          our own Laravel validation
 |   - RFC 9110     JRB validation ({ title, errors, traceId })
 |   - "000".."004" registration status codes (string, in the body)
 |   - 200/202/400/404 HTTP statuses from lookups and resolves
 * ---------------------------------------------------------------------- */

function flattenErrors(errors) {
  if (!errors) return []
  if (Array.isArray(errors)) return errors
  return Object.entries(errors).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${m}`)
  )
}

const REGISTRATION_CODES = {
  '000': { tone: 'success', title: 'Registration completed' },
  '001': { tone: 'warning', title: 'Already registered' },
  '002': { tone: 'error', title: 'Missing field' },
  '003': { tone: 'warning', title: 'Lookup required first' },
  '004': { tone: 'error', title: 'Validation failed' },
}

export function interpret(status, body) {
  if (status === 0 || body === null) {
    return {
      tone: 'error',
      title: 'Could not reach the server',
      message: body?.message ?? 'The request never completed.',
      details: [],
    }
  }

  // Our own validation, before anything left Laravel.
  if (status === 422) {
    return {
      tone: 'error',
      title: 'Check the form',
      message: body.message ?? 'Some fields need attention.',
      details: flattenErrors(body.errors),
    }
  }

  // JRB problem-details (RFC 9110).
  if (body?.title && body?.errors) {
    return {
      tone: 'error',
      title: body.title,
      message: body.traceId ? `Trace ID: ${body.traceId}` : '',
      details: flattenErrors(body.errors),
    }
  }

  // Registration / resolve status codes arrive as strings ("000", "202"…).
  const code = typeof body?.status === 'string' ? body.status : body?.statusCode
  if (typeof code === 'string' && REGISTRATION_CODES[code]) {
    const meta = REGISTRATION_CODES[code]
    return {
      tone: meta.tone,
      title: meta.title,
      message: body.message ?? '',
      details: flattenErrors(body.error),
      data: body.data ?? (body.taxId ? { taxId: body.taxId } : null),
      code,
    }
  }

  // Cooperative / TaxID verification return a bare "200" statusCode.
  if (code === '200') {
    return { tone: 'success', title: 'Successful', message: body.message ?? '', details: [], data: body }
  }

  if (status === 202) {
    return {
      tone: 'warning',
      title: 'Record incomplete',
      message: body?.message ?? 'Tax ID found, but the record is incomplete.',
      details: [],
      data: body?.data ?? null,
      next: 'complete_registration',
    }
  }

  if (status >= 200 && status < 300) {
    return {
      tone: 'success',
      title: body?.message ?? 'Success',
      message: '',
      details: [],
      data: body?.data ?? body,
    }
  }

  return {
    tone: 'error',
    title: status === 404 ? 'Not found' : 'Request failed',
    message: body?.message ?? `The API responded with status ${status}.`,
    details: flattenErrors(body?.error),
    data: body?.data ?? null,
  }
}

/* -------------------------------------------------------------------------
 | Lookup option mapping
 |
 | The Lookups doc documents four shapes (organisation types, sectors, line of
 | business, tax authority). The eight lookups referenced only by the v2.2
 | field tables have documented URLs but undocumented response shapes, so we
 | fall back to picking the most plausible id/code and label keys.
 * ---------------------------------------------------------------------- */

function pickKey(item, candidates, predicate) {
  for (const candidate of candidates) {
    if (item[candidate] !== undefined) return candidate
  }
  return Object.keys(item).find(predicate)
}

export function toOptions(items, { valueKey, labelKey, prefer = 'id' } = {}) {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => {
      if (item === null || typeof item !== 'object') {
        return { value: item, label: String(item) }
      }

      const vKey =
        valueKey ??
        (prefer === 'code'
          ? pickKey(item, ['code'], (k) => /code$/i.test(k) && !/sector/i.test(k))
          : pickKey(item, ['id'], (k) => /id$/i.test(k)))

      const lKey =
        labelKey ??
        pickKey(
          item,
          ['name', 'orgName', 'sectorName', 'lobName', 'description', 'title'],
          (k) => /name|desc|title/i.test(k) && k !== vKey
        )

      const value = vKey ? item[vKey] : Object.values(item)[0]
      const label = lKey ? item[lKey] : String(value)

      return { value, label: String(label), raw: item }
    })
    .filter((option) => option.value !== undefined && option.value !== null)
}
