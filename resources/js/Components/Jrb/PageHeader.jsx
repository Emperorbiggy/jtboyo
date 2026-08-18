import React from 'react'

/**
 * Page title plus the upstream JRB endpoint it maps to, so an operator
 * debugging with the PDF open can see which section they are looking at.
 */
export default function PageHeader({ title, section, description, method, endpoint }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {section && (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {section}
          </span>
        )}
      </div>

      {description && <p className="mt-1.5 max-w-3xl text-sm text-gray-600">{description}</p>}

      {endpoint && (
        <div className="mt-3 flex flex-wrap items-center gap-2 overflow-x-auto">
          <span
            className={`rounded px-2 py-0.5 text-xs font-bold ${
              method === 'GET' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {method}
          </span>
          <code className="whitespace-nowrap rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{endpoint}</code>
        </div>
      )}
    </div>
  )
}
