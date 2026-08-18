import React, { useEffect, useState } from 'react'
import { getLookup, toOptions } from '@/lib/jrb'
import { Select } from './Form'

// Lookup lists are static reference data and some run to hundreds of rows, so
// they are fetched once per page load and shared across every field that needs
// them. Keyed by endpoint path.
const cache = new Map()

export function loadLookup(path) {
  if (!cache.has(path)) {
    cache.set(
      path,
      getLookup(path).then((result) => (result.status === 200 ? result.body?.data ?? [] : []))
    )
  }

  return cache.get(path)
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
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!path || disabled) {
      setOptions([])
      return
    }

    let live = true
    setLoading(true)
    setFailed(false)

    loadLookup(path)
      .then((items) => {
        if (!live) return
        const mapped = toOptions(items, { valueKey, labelKey, prefer })
        setOptions(mapped)
        setFailed(mapped.length === 0)
      })
      .finally(() => live && setLoading(false))

    return () => {
      live = false
    }
  }, [path, disabled, valueKey, labelKey, prefer])

  // If the lookup is unreachable, fall back to free text so the form stays
  // usable rather than trapping the operator behind an empty dropdown.
  if (failed && !loading) {
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
        <p className="mt-1 text-xs text-amber-700">
          Lookup unavailable — enter the value manually.
        </p>
      </div>
    )
  }

  return (
    <Select
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      loading={loading}
      hint={disabled ? disabledHint : hint}
    />
  )
}
