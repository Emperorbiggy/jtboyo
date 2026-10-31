import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { FaBolt, FaCheck, FaCopy, FaKey, FaPlay, FaShieldAlt, FaTerminal, FaTimes, FaBars } from 'react-icons/fa'
import { ENDPOINTS, HTTP_ERRORS, LOOKUPS, REGISTRATION_CODES } from '@/lib/apiDocs'
import { LANGUAGES, sample, tokenize } from '@/lib/codeSamples'

/* -------------------------------------------------------------------------
 | Small helpers
 * ---------------------------------------------------------------------- */

const BASE_URL = (typeof window !== 'undefined' ? window.location.origin : '') + '/api/v1'

// Storage can be blocked (private windows, strict settings); the page must still work.
const store = {
  get: (area, key, fallback) => {
    try {
      return window[area].getItem(key) ?? fallback
    } catch {
      return fallback
    }
  },
  set: (area, key, value) => {
    try {
      window[area].setItem(key, value)
    } catch {}
  },
}

const METHOD_STYLES = {
  GET: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  POST: 'bg-green-100 text-green-800 ring-green-600/20',
}

const TOKEN_STYLES = {
  comment: 'text-slate-500 italic',
  key: 'text-sky-300',
  string: 'text-emerald-300',
  variable: 'text-rose-300',
  number: 'text-amber-300',
  keyword: 'text-violet-300',
  plain: '',
}

function statusTone(status) {
  if (status >= 200 && status < 300) return 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30'
  if (status >= 400 && status < 500) return 'bg-amber-500/15 text-amber-300 ring-amber-400/30'
  return 'bg-rose-500/15 text-rose-300 ring-rose-400/30'
}

function MethodBadge({ method, className = '' }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset ${METHOD_STYLES[method]} ${className}`}>
      {method}
    </span>
  )
}

function Code({ code, language }) {
  const tokens = useMemo(() => tokenize(code, language), [code, language])
  return (
    <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed text-slate-200">
      <code className="font-mono">
        {tokens.map(([type, text], i) => (
          <span key={i} className={TOKEN_STYLES[type]}>
            {text}
          </span>
        ))}
      </code>
    </pre>
  )
}

function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white ${className}`}
      aria-label="Copy to clipboard"
    >
      {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

/* -------------------------------------------------------------------------
 | Code panels
 * ---------------------------------------------------------------------- */

function RequestPanel({ endpoint, language, setLanguage, onTry }) {
  const code = sample(language, {
    method: endpoint.method,
    url: BASE_URL + endpoint.path,
    body: endpoint.body ?? null,
  })

  return (
    <div className="overflow-hidden rounded-xl bg-slate-900 shadow-xl ring-1 ring-slate-800">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-slate-950/60 px-2">
        <div className="flex overflow-x-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                language === lang.id
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <CopyButton text={code} className="shrink-0" />
      </div>
      <div className="max-h-[28rem] overflow-y-auto">
        <Code code={code} language={language} />
      </div>
      <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-4 py-2.5">
        <span className="truncate font-mono text-[11px] text-slate-500">
          {endpoint.method} /api/v1{endpoint.path}
        </span>
        <button
          type="button"
          onClick={onTry}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          <FaPlay className="text-[10px]" /> Try it
        </button>
      </div>
    </div>
  )
}

function ResponsePanel({ responses }) {
  const [active, setActive] = useState(0)
  const response = responses[active]
  const text = JSON.stringify(response.body, null, 2)

  return (
    <div className="overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-slate-950/60 px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {responses.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset transition ${
                i === active ? statusTone(r.status) : 'text-slate-400 ring-transparent hover:text-slate-200'
              }`}
            >
              {r.status} · {r.label}
            </button>
          ))}
        </div>
        <CopyButton text={text} className="shrink-0" />
      </div>
      <Code code={text} language="json" />
    </div>
  )
}

/* -------------------------------------------------------------------------
 | Try-it console
 * ---------------------------------------------------------------------- */

function TryItDrawer({ endpoint, onClose }) {
  const [apiKey, setApiKey] = useState(() => store.get('sessionStorage', 'jrb-docs-key', ''))
  const [path, setPath] = useState(endpoint.path)
  const [body, setBody] = useState(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const saveKey = (value) => {
    setApiKey(value)
    store.set('sessionStorage', 'jrb-docs-key', value)
  }

  const send = async (e) => {
    e.preventDefault()
    setResult(null)

    let payload
    if (endpoint.method !== 'GET' && body.trim()) {
      try {
        payload = JSON.stringify(JSON.parse(body))
      } catch (error) {
        setResult({ error: `The request body is not valid JSON: ${error.message}` })
        return
      }
    }

    setSending(true)
    const started = performance.now()
    try {
      const response = await fetch(BASE_URL + path, {
        method: endpoint.method,
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: 'application/json',
          ...(payload ? { 'Content-Type': 'application/json' } : {}),
        },
        body: payload,
      })
      const text = await response.text()
      let pretty = text
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2)
      } catch {}
      setResult({ status: response.status, ms: Math.round(performance.now() - started), body: pretty })
    } catch (error) {
      setResult({ error: error.message })
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={send}
        className="relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-slate-900 text-slate-200 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Try it</div>
            <div className="truncate text-base font-semibold text-white">{endpoint.title}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {endpoint.live && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
              This endpoint writes to the live JRB register. Only send real taxpayer details you are authorised to submit.
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">API key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="Paste your API key"
              autoComplete="off"
              className="w-full rounded-lg border-0 bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
            />
            <span className="mt-1.5 block text-[11px] text-slate-500">
              Kept in this browser tab only. Calls come from your own IP, so it must be on the key’s whitelist.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Request</span>
            <div className="flex items-center overflow-hidden rounded-lg bg-slate-800 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-emerald-400">
              <MethodBadge method={endpoint.method} className="ml-2 shrink-0" />
              <span className="pl-2 font-mono text-sm text-slate-500">/api/v1</span>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent px-0.5 py-2 font-mono text-sm text-white focus:ring-0"
              />
            </div>
            {endpoint.lookups && (
              <span className="mt-1.5 block text-[11px] text-slate-500">
                Edit the path to try another list, e.g. /lookups/lgas/by-state/OY
              </span>
            )}
          </label>

          {endpoint.method !== 'GET' && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Body (JSON)</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={Math.min(18, body.split('\n').length + 1)}
                spellCheck={false}
                className="w-full rounded-lg border-0 bg-slate-800 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-emerald-200 ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400"
              />
            </label>
          )}

          {result && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">Response</span>
                {result.status !== undefined && (
                  <span className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 font-mono font-semibold ring-1 ring-inset ${statusTone(result.status)}`}>
                      {result.status}
                    </span>
                    <span className="text-slate-500">{result.ms} ms</span>
                  </span>
                )}
              </div>
              {result.error ? (
                <div className="rounded-lg bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300 ring-1 ring-rose-400/30">
                  {result.error}
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg bg-slate-950 ring-1 ring-white/10">
                  <Code code={result.body || '(empty response)'} language="json" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <button
            type="submit"
            disabled={sending || !apiKey.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? 'Sending…' : (<><FaPlay className="text-xs" /> Send request</>)}
          </button>
        </div>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------
 | Content blocks
 * ---------------------------------------------------------------------- */

function Section({ id, children, className = '' }) {
  return (
    <section id={id} data-section className={`scroll-mt-24 border-b border-gray-200 py-14 ${className}`}>
      {children}
    </section>
  )
}

function H2({ eyebrow, children }) {
  return (
    <div className="mb-4">
      {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-700">{eyebrow}</div>}
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">{children}</h2>
    </div>
  )
}

function FieldTable({ fields }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">Body parameters</h3>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {fields.map(([name, type, required, description]) => (
          <div key={name} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <code className="font-mono text-[13px] font-semibold text-gray-900">{name}</code>
              <span className="font-mono text-[11px] text-gray-500">{type}</span>
              {required ? (
                <span className="text-[11px] font-semibold text-rose-600">required</span>
              ) : (
                <span className="text-[11px] text-gray-400">optional</span>
              )}
            </div>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function EndpointSection({ endpoint, language, setLanguage, onTry }) {
  return (
    <Section id={endpoint.id}>
      <div className="grid gap-8 xl:grid-cols-2 xl:gap-12">
        <div className="min-w-0">
          <H2 eyebrow={endpoint.group}>{endpoint.title}</H2>
          <div className="mb-5 flex items-center gap-2 overflow-x-auto">
            <MethodBadge method={endpoint.method} />
            <code className="whitespace-nowrap font-mono text-sm text-gray-700">/api/v1{endpoint.path}</code>
          </div>
          <p className="leading-relaxed text-gray-600">{endpoint.summary}</p>

          {endpoint.live && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Live register.</strong> A successful call creates or completes a real taxpayer record with JRB.
            </div>
          )}

          {endpoint.fields && <FieldTable fields={endpoint.fields} />}

          {endpoint.lookups && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Available lists</h3>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {LOOKUPS.map(([path, description]) => (
                  <div key={path} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MethodBadge method="GET" />
                      <code className="break-all font-mono text-[13px] text-gray-900">{path}</code>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
          <RequestPanel endpoint={endpoint} language={language} setLanguage={setLanguage} onTry={() => onTry(endpoint)} />
          <ResponsePanel responses={endpoint.responses} />
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------------
 | Navigation
 * ---------------------------------------------------------------------- */

const GUIDE = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'authentication', title: 'Authentication' },
  { id: 'errors', title: 'Errors & status codes' },
]

function groupedEndpoints() {
  const groups = []
  for (const endpoint of ENDPOINTS) {
    let group = groups.find((g) => g.name === endpoint.group)
    if (!group) groups.push((group = { name: endpoint.group, items: [] }))
    group.items.push(endpoint)
  }
  return groups
}

function Sidebar({ active, onNavigate }) {
  const link = (id, children) => (
    <a
      href={`#${id}`}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
        active === id ? 'bg-green-50 font-semibold text-green-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </a>
  )

  return (
    <nav className="space-y-6">
      <div>
        <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Guide</div>
        {GUIDE.map((item) => (
          <div key={item.id}>{link(item.id, item.title)}</div>
        ))}
      </div>
      {groupedEndpoints().map((group) => (
        <div key={group.name}>
          <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group.name}</div>
          {group.items.map((endpoint) => (
            <div key={endpoint.id}>
              {link(
                endpoint.id,
                <>
                  <span className={`w-9 shrink-0 font-mono text-[10px] font-bold ${endpoint.method === 'GET' ? 'text-sky-600' : 'text-green-600'}`}>
                    {endpoint.method}
                  </span>
                  <span className="truncate">{endpoint.title}</span>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </nav>
  )
}

/* -------------------------------------------------------------------------
 | Page
 * ---------------------------------------------------------------------- */

export default function Developers() {
  const [language, setLanguageState] = useState(() => store.get('localStorage', 'jrb-docs-language', 'curl'))
  const [trying, setTrying] = useState(null)
  const [active, setActive] = useState('introduction')
  const [menuOpen, setMenuOpen] = useState(false)
  const contentRef = useRef(null)

  const setLanguage = (id) => {
    setLanguageState(id)
    store.set('localStorage', 'jrb-docs-language', id)
  }

  // Highlight the section currently at the top of the viewport.
  useEffect(() => {
    const sections = contentRef.current?.querySelectorAll('[data-section]') ?? []
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const quickstart = sample(language, { method: 'POST', url: `${BASE_URL}/taxid/verify`, body: { taxId: '2513706419967' } })

  return (
    <>
      <Head title="API Documentation" />

      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button className="text-gray-600 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <FaBars className="text-lg" />
              </button>
              <a href="#introduction" className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0E5C17] text-xs font-bold text-white">JRB</span>
                <span className="font-semibold">Oyo</span>
                <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 sm:inline">
                  Developers
                </span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-green-50 px-2.5 py-1 font-mono text-xs text-green-800 ring-1 ring-inset ring-green-600/20 md:inline">
                v1
              </span>
              <Link
                href="/create-app"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0E5C17] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0b4a12]"
              >
                <FaKey className="text-xs" /> <span className="hidden sm:inline">Manage API keys</span><span className="sm:hidden">Keys</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0E5C17] via-[#0b4a12] to-[#062b0a]">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-green-100 ring-1 ring-inset ring-white/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live · connected to the JRB production register
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Oyo State Tax ID API</h1>
              <p className="mt-4 text-base leading-relaxed text-green-100/90 sm:text-lg">
                Verify Tax IDs, look up taxpayers and complete registrations with the Joint Revenue Board — from your
                own systems, over a simple JSON API.
              </p>
              <div className="mt-6 flex max-w-full items-center gap-2 overflow-hidden rounded-lg bg-black/25 py-1.5 pl-3 pr-1.5 ring-1 ring-inset ring-white/15 sm:inline-flex">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-green-300">Base URL</span>
                <code className="min-w-0 truncate font-mono text-sm text-white">{BASE_URL}</code>
                <CopyButton text={BASE_URL} className="shrink-0 text-green-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-screen-2xl gap-10 px-4 sm:px-6">
          {/* Sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-8 lg:block">
            <Sidebar active={active} />
          </aside>

          {menuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white px-3 py-6 shadow-xl">
                <Sidebar active={active} onNavigate={() => setMenuOpen(false)} />
              </div>
            </div>
          )}

          <main ref={contentRef} className="min-w-0 flex-1">
            {/* Introduction */}
            <Section id="introduction">
              <div className="grid gap-8 xl:grid-cols-2 xl:gap-12">
                <div>
                  <H2 eyebrow="Guide">Introduction</H2>
                  <p className="leading-relaxed text-gray-600">
                    The API mirrors the JRB State API Console. Every endpoint accepts and returns JSON, and passes JRB’s
                    own response through unchanged, so what you see in the console is what your code receives.
                  </p>
                  <ol className="mt-8 space-y-5">
                    {[
                      [FaKey, 'Get an API key', 'Ask the JRB Oyo team for a key. Give them the public IP address(es) your servers call from — requests from any other IP are refused.'],
                      [FaTerminal, 'Make your first call', 'Verify a Tax ID with the snippet on the right. Pick your language once; every example on the page follows it.'],
                      [FaBolt, 'Go further', 'Look up and register individuals and organisations, and resolve cooperatives and MDAs.'],
                    ].map(([Icon, title, text], i) => (
                      <li key={title} className="flex gap-4">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-100 text-green-800">
                          <Icon className="text-sm" />
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {i + 1}. {title}
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
                  <div className="overflow-hidden rounded-xl bg-slate-900 shadow-xl ring-1 ring-slate-800">
                    <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                        <span className="ml-2 text-xs text-slate-400">Quick start · {LANGUAGES.find((l) => l.id === language)?.label}</span>
                      </span>
                      <CopyButton text={quickstart} />
                    </div>
                    <Code code={quickstart} language={language} />
                  </div>
                </div>
              </div>
            </Section>

            {/* Authentication */}
            <Section id="authentication">
              <div className="grid gap-8 xl:grid-cols-2 xl:gap-12">
                <div>
                  <H2 eyebrow="Guide">Authentication</H2>
                  <p className="leading-relaxed text-gray-600">
                    Send your key as a bearer token on every request. Each key is tied to a whitelist of IP addresses,
                    and every call is logged against the key that made it.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    {[
                      'Keep keys on your server. Never ship them in a mobile app or browser code.',
                      'One key per organisation or consultant, so activity can be traced and a key revoked on its own.',
                      'If a key leaks, ask the JRB Oyo team to disable it — it stops working immediately.',
                    ].map((text) => (
                      <li key={text} className="flex gap-3">
                        <FaShieldAlt className="mt-0.5 shrink-0 text-green-700" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="min-w-0 overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 xl:self-start">
                  <div className="border-b border-white/10 bg-slate-950/60 px-4 py-2.5 text-xs text-slate-400">Request header</div>
                  <Code code={'Authorization: Bearer YOUR_API_KEY'} language="curl" />
                </div>
              </div>
            </Section>

            {/* Errors */}
            <Section id="errors">
              <H2 eyebrow="Guide">Errors & status codes</H2>
              <p className="max-w-3xl leading-relaxed text-gray-600">
                Standard HTTP status codes tell you what happened. Lookups can also answer <code className="font-mono text-sm">202</code> when
                a Tax ID exists but the record is incomplete. Registrations return a status code in the body.
                Example responses on this page show the shape; message text may vary.
              </p>

              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold">HTTP status</div>
                  <div className="divide-y divide-gray-100">
                    {HTTP_ERRORS.map(([code, meaning, example]) => (
                      <div key={code} className="flex gap-4 px-4 py-3">
                        <code className={`w-10 shrink-0 font-mono text-sm font-bold ${code >= 500 ? 'text-rose-600' : 'text-amber-600'}`}>{code}</code>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-700">{meaning}</p>
                          <code className="mt-1 block truncate font-mono text-[11px] text-gray-400">{example}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white xl:self-start">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold">
                    Registration <code className="font-mono">status</code> codes
                  </div>
                  <div className="divide-y divide-gray-100">
                    {REGISTRATION_CODES.map(([code, meaning]) => (
                      <div key={code} className="flex gap-4 px-4 py-3">
                        <code className={`w-10 shrink-0 font-mono text-sm font-bold ${code === '000' ? 'text-green-700' : 'text-amber-600'}`}>{code}</code>
                        <p className="text-sm text-gray-700">{meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {ENDPOINTS.map((endpoint) => (
              <EndpointSection
                key={endpoint.id}
                endpoint={endpoint}
                language={language}
                setLanguage={setLanguage}
                onTry={setTrying}
              />
            ))}

            <footer className="py-10 text-sm text-gray-500">
              Oyo State Joint Revenue Board · API v1
            </footer>
          </main>
        </div>
      </div>

      {trying && <TryItDrawer key={trying.id} endpoint={trying} onClose={() => setTrying(null)} />}
    </>
  )
}
