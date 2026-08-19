import React from 'react'

export default function PageHeader({ title, section, description }) {
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
    </div>
  )
}
