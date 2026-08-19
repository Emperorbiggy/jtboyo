import React, { useEffect, useRef, useState } from 'react'
import { Link } from '@inertiajs/react'
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCopy } from 'react-icons/fa'

const TONES = {
  success: {
    wrap: 'border-green-300 bg-green-50',
    heading: 'text-green-900',
    icon: <FaCheckCircle className="text-xl text-green-600" />,
  },
  warning: {
    wrap: 'border-amber-300 bg-amber-50',
    heading: 'text-amber-900',
    icon: <FaExclamationTriangle className="text-xl text-amber-500" />,
  },
  error: {
    wrap: 'border-red-300 bg-red-50',
    heading: 'text-red-900',
    icon: <FaTimesCircle className="text-xl text-red-600" />,
  },
}

const LABELS = {
  tax_id: 'Tax ID',
  taxId: 'Tax ID',
  taxpayerName: 'Taxpayer name',
  taxpayerType: 'Taxpayer type',
  registeredName: 'Registered name',
  cacRegNo: 'CAC reg. number',
  nin: 'NIN',
  name: 'Name',
  next_step: 'Next step',
  source: 'Source',
  mismatch_fields: 'Mismatch fields',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(String(text))
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-white hover:text-gray-700"
    >
      <FaCopy /> {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function DataGrid({ data }) {
  if (!data || typeof data !== 'object') return null

  const entries = Object.entries(data).filter(([, v]) => v !== null && typeof v !== 'object')
  if (entries.length === 0) return null

  return (
    <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-baseline justify-between gap-2 border-b border-black/5 py-1">
          <dt className="text-xs uppercase tracking-wide text-gray-500">{LABELS[key] ?? key}</dt>
          <dd className="flex items-center text-sm font-medium text-gray-900">
            <span className="font-mono">{String(value)}</span>
            {/^(tax_?id)$/i.test(key) && <CopyButton text={value} />}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Renders an interpreted JRB response. `result` is the object returned by
 * interpret() in lib/jrb.
 *
 * `continueTo` turns a 202 into an actionable link to the matching
 * Complete New Registration page.
 */
export default function ResultPanel({ result, continueTo }) {
  const ref = useRef(null)

  // Some forms are long enough that a result rendered beneath them lands off
  // screen, making a successful submit look like nothing happened.
  useEffect(() => {
    if (result) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [result])

  if (!result) return null

  const tone = TONES[result.tone] ?? TONES.error

  return (
    <div ref={ref} className={`rounded-lg border p-4 ${tone.wrap}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{tone.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-semibold ${tone.heading}`}>{result.title}</h3>
            {result.code && (
              <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs text-gray-700">
                {result.code}
              </span>
            )}
          </div>

          {result.message && <p className="mt-1 text-sm text-gray-700">{result.message}</p>}

          {result.at && <p className="mt-1 text-xs text-gray-500">Received {result.at}</p>}

          {result.details?.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
              {result.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}

          <DataGrid data={result.data} />

          {result.next === 'complete_registration' && continueTo && (
            <Link
              href={continueTo}
              className="mt-4 inline-flex items-center rounded-md bg-[#0E7F1B] px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              Continue to complete registration →
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}
