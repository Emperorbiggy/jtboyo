import React, { useState } from 'react'
import { Link } from '@inertiajs/react'
import { FaCheckCircle, FaCopy, FaIdCard, FaPlus } from 'react-icons/fa'

/**
 * Shown in place of the form once a registration returns status 000.
 *
 * The Tax ID is the whole point of the exercise and the forms are long, so it
 * gets a screen of its own rather than a panel below the fold.
 */
export default function RegistrationSuccess({ result, title, onRegisterAnother }) {
  const [copied, setCopied] = useState(false)

  const taxId = result?.data?.taxId ?? result?.data?.tax_id ?? null

  const copy = () => {
    navigator.clipboard?.writeText(String(taxId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-green-300 bg-green-50 p-8 text-center">
        <FaCheckCircle className="mx-auto text-5xl text-green-600" />

        <h1 className="mt-4 text-2xl font-bold text-green-900">{title}</h1>
        <p className="mt-1 text-sm text-green-800">{result.message}</p>

        {taxId && (
          <div className="mt-6 rounded-lg border border-green-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tax ID</div>
            <div className="mt-1 break-all font-mono text-3xl font-bold tracking-tight text-gray-900">{taxId}</div>

            <button
              type="button"
              onClick={copy}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FaCopy className="text-xs" />
              {copied ? 'Copied' : 'Copy Tax ID'}
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRegisterAnother}
            className="inline-flex items-center gap-2 rounded-md bg-[#0E7F1B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            <FaPlus className="text-xs" /> Register another
          </button>

          {taxId && (
            <Link
              href={`/jrb/taxid-verification?taxId=${encodeURIComponent(taxId)}`}
              className="inline-flex items-center gap-2 rounded-md border border-[#0E7F1B] px-5 py-2.5 text-sm font-semibold text-[#0E7F1B] hover:bg-green-50"
            >
              <FaIdCard className="text-xs" /> Verify this Tax ID
            </Link>
          )}

          <Link href="/dashboard" className="text-sm text-gray-600 underline hover:text-gray-800">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
