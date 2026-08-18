import React from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import {
  FaUser,
  FaBuilding,
  FaHandshake,
  FaLandmark,
  FaIdCard,
  FaListUl,
  FaArrowRight,
} from 'react-icons/fa'
import DashboardLayout from '@/Layouts/DashboardLayout'

const FLOWS = [
  {
    title: 'Individual',
    icon: FaUser,
    blurb: 'Find a taxpayer’s Tax ID from their NIN, then complete the record if it comes back incomplete.',
    steps: [
      { label: 'Tax ID Lookup', href: '/jrb/individual/lookup', tag: 'First-Level' },
      { label: 'Complete Registration', href: '/jrb/individual/register', tag: 'Second-Level' },
    ],
  },
  {
    title: 'Non-Individual',
    icon: FaBuilding,
    blurb: 'Find a company’s Tax ID from its CAC number and organisation type, then complete the corporate record.',
    steps: [
      { label: 'Tax ID Lookup', href: '/jrb/non-individual/lookup', tag: 'First-Level' },
      { label: 'Complete Registration', href: '/jrb/non-individual/register', tag: 'Second-Level' },
    ],
  },
]

const DIRECT = [
  {
    title: 'Cooperative',
    icon: FaHandshake,
    href: '/jrb/cooperative',
    blurb: 'Resolve a cooperative society’s Tax ID. No prior lookup needed.',
  },
  {
    title: 'MDAs',
    icon: FaLandmark,
    href: '/jrb/mdas',
    blurb: 'Resolve a State or Federal MDA’s Tax ID by organisation number.',
  },
  {
    title: 'Tax ID Verification',
    icon: FaIdCard,
    href: '/jrb/taxid-verification',
    blurb: 'Confirm an existing Tax ID and see who it belongs to.',
  },
  {
    title: 'Reference Lookups',
    icon: FaListUl,
    href: '/jrb/lookups',
    blurb: 'Browse organisation types, sectors, lines of business, states and more.',
  },
]

export default function Dashboard() {
  const { props } = usePage()
  const user = props.auth?.user

  return (
    <>
      <Head title="Dashboard" />
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="mt-1 text-sm text-gray-600">
            JRB State API console — Tax ID lookup, registration, resolution and verification.
          </p>
        </div>

        {/* Two-step flows */}
        <div className="grid gap-5 lg:grid-cols-2">
          {FLOWS.map((flow) => {
            const Icon = flow.icon

            return (
              <section key={flow.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-green-100 p-2.5">
                    <Icon className="text-xl text-[#0E7F1B]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{flow.title}</h2>
                    <p className="mt-0.5 text-sm text-gray-600">{flow.blurb}</p>
                  </div>
                </div>

                <ol className="mt-4 space-y-2">
                  {flow.steps.map((step, index) => (
                    <li key={step.href}>
                      <Link
                        href={step.href}
                        className="group flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5 transition hover:border-[#0E7F1B] hover:bg-green-50"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 group-hover:bg-[#0E7F1B] group-hover:text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{step.label}</span>
                        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          {step.tag}
                        </span>
                        <FaArrowRight className="text-xs text-gray-400 group-hover:text-[#0E7F1B]" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>

        {/* Single-call endpoints */}
        <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Resolve, verify &amp; reference
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIRECT.map((card) => {
            const Icon = card.icon

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#0E7F1B] hover:shadow"
              >
                <Icon className="text-2xl text-[#0E7F1B]" />
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-[#0E7F1B]">{card.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{card.blurb}</p>
              </Link>
            )
          })}
        </div>
      </DashboardLayout>
    </>
  )
}
