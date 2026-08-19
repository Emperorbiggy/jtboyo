import React, { useEffect, useMemo, useState } from 'react'
import { Head } from '@inertiajs/react'
import { FaSearch, FaDownload } from 'react-icons/fa'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import { getLookup } from '@/lib/jrb'

// Documented in the Lookups doc; the rest are referenced by the v2.2 field
// tables, which give their URLs but not their response shapes.
const LOOKUPS = [
  { key: 'organization-types', label: 'Organisation Types', path: '/lookups/organization-types', documented: true },
  { key: 'business-sectors', label: 'Business Sectors', path: '/lookups/business-sectors', documented: true },
  { key: 'line-of-business', label: 'Line of Business', path: '/lookups/line-of-business', documented: true },
  { key: 'titles', label: 'Titles', path: '/lookups/titles' },
  { key: 'genders', label: 'Genders', path: '/lookups/genders' },
  { key: 'states', label: 'States', path: '/lookups/states' },
  { key: 'occupations', label: 'Occupations', path: '/lookups/occupations' },
  { key: 'marital-statuses', label: 'Marital Statuses', path: '/lookups/marital-statuses' },
  { key: 'nationalities', label: 'Nationalities', path: '/lookups/nationalities' },
  { key: 'countries', label: 'Countries', path: '/lookups/countries' },
]

const PARAMETERISED = [
  {
    key: 'lob-by-sector',
    label: 'Line of Business by Sector',
    build: (code) => `/lookups/line-of-business/by-sector/${encodeURIComponent(code)}`,
    placeholder: 'Sector code, e.g. U',
    documented: true,
  },
  {
    key: 'tax-authority',
    label: 'Tax Authority by State',
    build: (code) => `/lookups/tax-authority/by-state/${encodeURIComponent(code)}`,
    placeholder: 'State code, e.g. LA',
    documented: true,
  },
  {
    key: 'lgas',
    label: 'LGAs by State',
    build: (code) => `/lookups/lgas/by-state/${encodeURIComponent(code)}`,
    placeholder: 'State code, e.g. LA',
  },
]

function Table({ rows }) {
  if (!Array.isArray(rows)) {
    // Tax Authority by State returns a single object, not a list.
    return (
      <pre className="overflow-auto rounded bg-gray-900 p-4 text-xs text-gray-100">
        {JSON.stringify(rows, null, 2)}
      </pre>
    )
  }

  if (rows.length === 0) {
    return <p className="p-6 text-center text-sm text-gray-500">No rows returned.</p>
  }

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row ?? {}))))

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-4 py-2 font-semibold text-gray-700">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-green-50/50">
              {columns.map((column) => (
                <td key={column} className="whitespace-nowrap px-4 py-2 text-gray-700">
                  {typeof row?.[column] === 'boolean' ? String(row[column]) : row?.[column] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Lookups() {
  const [active, setActive] = useState(LOOKUPS[0])
  const [param, setParam] = useState('')
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const isParameterised = Boolean(active.build)

  const fetchRows = async (path) => {
    setLoading(true)
    setError(null)
    setRows(null)

    const { status, body } = await getLookup(path)

    if (status === 200 && body?.success) {
      setRows(body.data)
    } else {
      setError(body?.message ?? `Request failed with status ${status}.`)
    }

    setLoading(false)
  }

  useEffect(() => {
    setQuery('')
    if (!isParameterised) fetchRows(active.path)
    else setRows(null)
  }, [active])

  const filtered = useMemo(() => {
    if (!Array.isArray(rows) || !query.trim()) return rows

    const needle = query.toLowerCase()
    return rows.filter((row) =>
      Object.values(row ?? {}).some((value) => String(value).toLowerCase().includes(needle))
    )
  }, [rows, query])

  const exportCsv = () => {
    if (!Array.isArray(filtered) || filtered.length === 0) return

    const columns = Array.from(new Set(filtered.flatMap((row) => Object.keys(row ?? {}))))
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const csv = [
      columns.join(','),
      ...filtered.map((row) => columns.map((column) => escape(row?.[column])).join(',')),
    ].join('\n')

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${active.key}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head title="Lookups" />
      <DashboardLayout>
        <PageHeader
          title="Reference Lookups"
          section="Lookups v1"
          description="The reference lists that supply the IDs and codes used by the registration endpoints. Fetch once, then reuse the id or code as the matching field value."
        />

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <nav className="space-y-1">
            {[...LOOKUPS, ...PARAMETERISED].map((lookup) => (
              <button
                key={lookup.key}
                onClick={() => {
                  setActive(lookup)
                  setParam('')
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                  active.key === lookup.key
                    ? 'bg-[#0E7F1B] font-semibold text-white'
                    : 'text-gray-700 hover:bg-green-50'
                }`}
              >
                <span>{lookup.label}</span>
                {!lookup.documented && (
                  <span
                    title="URL documented in v2.2; response shape not documented"
                    className={`text-[10px] ${active.key === lookup.key ? 'text-green-100' : 'text-amber-600'}`}
                  >
                    ?
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
              <h2 className="mr-auto text-sm font-semibold text-gray-800">{active.label}</h2>

              {isParameterised ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (param.trim()) fetchRows(active.build(param.trim()))
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={param}
                    onChange={(e) => setParam(e.target.value.toUpperCase())}
                    placeholder={active.placeholder}
                    className="w-44 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#0E7F1B] focus:outline-none focus:ring-1 focus:ring-[#0E7F1B]"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-[#0E7F1B] px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                  >
                    Fetch
                  </button>
                </form>
              ) : (
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter…"
                    className="w-52 rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-[#0E7F1B] focus:outline-none focus:ring-1 focus:ring-[#0E7F1B]"
                  />
                </div>
              )}

              {Array.isArray(filtered) && filtered.length > 0 && (
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FaDownload className="text-xs" /> CSV
                </button>
              )}
            </div>

            {Array.isArray(filtered) && (
              <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
                {filtered.length} {filtered.length === 1 ? 'row' : 'rows'}
                {Array.isArray(rows) && filtered.length !== rows.length && ` of ${rows.length}`}
              </div>
            )}

            {loading && <p className="p-6 text-center text-sm text-gray-500">Loading…</p>}
            {error && <p className="p-6 text-center text-sm text-red-600">{error}</p>}
            {!loading && !error && rows === null && isParameterised && (
              <p className="p-6 text-center text-sm text-gray-500">
                Enter a code above to fetch this lookup.
              </p>
            )}
            {!loading && !error && rows !== null && <Table rows={filtered} />}
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
