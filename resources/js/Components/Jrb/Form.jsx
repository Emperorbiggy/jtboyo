import React, { useEffect, useState } from 'react'

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm ' +
  'focus:border-[#0E7F1B] focus:ring-1 focus:ring-[#0E7F1B] focus:outline-none ' +
  'disabled:bg-gray-100 disabled:text-gray-500'

export function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="ml-0.5 text-red-600">*</span>}
    </label>
  )
}

export function Hint({ children }) {
  if (!children) return null
  return <p className="mt-1 text-xs text-gray-500">{children}</p>
}

export function Field({ name, label, value, onChange, required, hint, type = 'text', placeholder, ...rest }) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={inputClass}
        {...rest}
      />
      <Hint>{hint}</Hint>
    </div>
  )
}

export function Select({ name, label, value, onChange, options, required, hint, loading, placeholder = 'Select…' }) {
  // JRB lookup values are not unique — organisation types reuse one id across
  // several names (id 1 is BUSINESS NAME, PARTNERSHIP and SOLE PROPRIETORSHIP).
  // The <select> is therefore keyed by position and mapped back to the real
  // value on change, so the operator's actual choice stays on screen instead
  // of snapping to the first entry sharing that id.
  const [index, setIndex] = useState('')

  useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      setIndex('')
      return
    }

    // Keep the chosen row if it still carries the current value.
    if (index !== '' && String(options[index]?.value) === String(value)) return

    const found = options.findIndex((option) => String(option.value) === String(value))
    setIndex(found >= 0 ? String(found) : '')
  }, [value, options])

  const handleChange = (e) => {
    const position = e.target.value
    setIndex(position)
    onChange(name, position === '' ? '' : options[Number(position)].value)
  }

  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <select id={name} name={name} value={index} onChange={handleChange} disabled={loading} className={inputClass}>
        <option value="">{loading ? 'Loading…' : placeholder}</option>
        {options.map((option, position) => (
          <option key={`${option.value}-${position}`} value={position}>
            {option.label}
          </option>
        ))}
      </select>
      <Hint>{hint}</Hint>
    </div>
  )
}

/** JRB wants real booleans, so this posts true/false rather than "on". */
export function BoolField({ name, label, value, onChange, hint }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
      <input
        id={name}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(name, e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0E7F1B] focus:ring-[#0E7F1B]"
      />
      <div>
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <Hint>{hint}</Hint>
      </div>
    </div>
  )
}

/**
 * dd/MM/yyyy text entry. The API is strict about the format, so we keep it a
 * plain masked text field rather than a native date input that would submit
 * yyyy-MM-dd.
 */
export function DateField({ name, label, value, onChange, required, hint, format = 'dd/MM/yyyy' }) {
  const mask = (raw) => {
    const digits = raw.replace(/\D/g, '')
    const parts = format === 'dd/MM' ? [2, 2] : [2, 2, 4]
    const out = []
    let cursor = 0

    for (const size of parts) {
      if (cursor >= digits.length) break
      out.push(digits.slice(cursor, cursor + size))
      cursor += size
    }

    return out.join('/')
  }

  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        inputMode="numeric"
        value={value ?? ''}
        placeholder={format}
        maxLength={format.length}
        onChange={(e) => onChange(name, mask(e.target.value))}
        className={inputClass}
      />
      <Hint>{hint ?? `Format: ${format}`}</Hint>
    </div>
  )
}

export function Section({ title, description, children, columns = 3 }) {
  const grid = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0E7F1B]">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className={`grid grid-cols-1 gap-4 ${grid}`}>{children}</div>
    </section>
  )
}

export function SubmitButton({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0E7F1B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-[#0E7F1B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 1010 10h-2A8 8 0 014 12z" />
        </svg>
      )}
      {children}
    </button>
  )
}
