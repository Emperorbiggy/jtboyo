import React, { useEffect, useState } from 'react'
import { FaRedo } from 'react-icons/fa'
import { getLookup, toOptions } from '@/lib/jrb'
import { Select } from './Form'

// Lookup lists are static reference data and some run to hundreds of rows, so a
// successful fetch is shared across every field that needs it, keyed by path.
//
// Only successful, non-empty results are cached. Caching a failure would pin a
// transient JRB error to that path for the rest of the page's life, so
// re-selecting a sector or state that failed once could never recover.
const cache = new Map()

export function loadLookup(path) {
  if (!cache.has(path)) {
    const request = getLookup(path)
      .then((result) => {
        const rows = Array.isArray(result.body?.data) ? result.body.data : []
        const ok = result.status === 200 && rows.length > 0

        if (!ok) {
          cache.delete(path)
        }

        return {
          rows,
          error:
            result.status === 200
              ? null
              : result.body?.message ?? `Lookup failed (HTTP ${result.status}).`,
        }
      })
      .catch((e) => {
        cache.delete(path)
        return { rows: [], error: e.message }
      })

    cache.set(path, request)
  }

  return cache.get(path)
}

/** Forget one cached lookup, or all of them. */
export function clearLookupCache(path) {
  if (path) cache.delete(path)
  else cache.clear()
}

/** Drop a lookup endpoint straight into a form as a <select>. */
export default function LookupSelect({
  path,
  name,
  label,
  value,
  onChange,
  required,
  hint,
  valueKey,
  labelKey,
  prefer = 'id',
  disabled,
  disabledHint,
}) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!path || disabled) {
      setOptions([])
      setError(null)
      return
    }

    let live = true
    setLoading(true)
    setError(null)

    loadLookup(path)
      .then(({ rows, error: failure }) => {
        if (!live) return
        setOptions(toOptions(rows, { valueKey, labelKey, prefer }))
        setError(failure)
      })
      .finally(() => live && setLoading(false))

    return () => {
      live = false
    }
  }, [path, disabled, valueKey, labelKey, prefer, attempt])

  const retry = () => {
    clearLookupCache(path)
    setAttempt((a) => a + 1)
  }

  // Unreachable lookup: fall back to free text so the form stays usable, but
  // offer a retry so a transient failure is not a dead end.
  if (error && !loading) {
    return (
      <div>
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
        <input
          id={name}
          name={name}
          value={value ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm shadow-sm focus:border-[#0E7F1B] focus:outline-none focus:ring-1 focus:ring-[#0E7F1B]"
        />
        <p className="mt-1 flex items-center gap-2 text-xs text-amber-700">
          <span className="min-w-0 flex-1 truncate" title={error}>
            {error} Enter the value manually, or
          </span>
          <button type="button" onClick={retry} className="inline-flex shrink-0 items-center gap-1 font-medium underline">
            <FaRedo className="text-[10px]" /> retry
          </button>
        </p>
      </div>
    )
  }

  return (
    <>
      <Select
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        required={required}
        loading={loading}
        hint={disabled ? disabledHint : hint}
        placeholder={!loading && options.length === 0 && !disabled ? 'No options returned' : 'Select…'}
      />
      {!loading && !disabled && path && options.length === 0 && (
        <button
          type="button"
          onClick={retry}
          className="-mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0E7F1B] underline"
        >
          <FaRedo className="text-[10px]" /> Reload {label.toLowerCase()}
        </button>
      )}
    </>
  )
}
