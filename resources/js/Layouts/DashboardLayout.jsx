import React, { useEffect, useState } from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import {
  FaUserCircle,
  FaTachometerAlt,
  FaUser,
  FaBuilding,
  FaHandshake,
  FaLandmark,
  FaIdCard,
  FaListUl,
  FaKey,
  FaBars,
  FaTimes,
} from 'react-icons/fa'

// Grouped to mirror the State API v2.2 document.
const NAV = [
  {
    group: null,
    items: [{ label: 'Overview', href: '/dashboard', icon: FaTachometerAlt }],
  },
  {
    group: 'Individual',
    items: [
      { label: 'Tax ID Lookup', href: '/jrb/individual/lookup', icon: FaUser },
      { label: 'Complete Registration', href: '/jrb/individual/register', icon: FaUser },
    ],
  },
  {
    group: 'Non-Individual',
    items: [
      { label: 'Tax ID Lookup', href: '/jrb/non-individual/lookup', icon: FaBuilding },
      { label: 'Complete Registration', href: '/jrb/non-individual/register', icon: FaBuilding },
    ],
  },
  {
    group: 'Resolve',
    items: [
      { label: 'Cooperative', href: '/jrb/cooperative', icon: FaHandshake },
      { label: 'MDAs', href: '/jrb/mdas', icon: FaLandmark },
    ],
  },
  {
    group: 'Verify',
    items: [{ label: 'Tax ID Verification', href: '/jrb/taxid-verification', icon: FaIdCard }],
  },
  {
    group: 'Reference',
    items: [
      { label: 'Lookups', href: '/jrb/lookups', icon: FaListUl },
      { label: 'Partner API Apps', href: '/create-app', icon: FaKey },
    ],
  },
]

function SidebarLink({ item, current, onNavigate }) {
  const Icon = item.icon
  const active = current === item.href

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
        active ? 'bg-white/15 font-semibold text-white' : 'text-green-50/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="shrink-0 text-base" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export default function DashboardLayout({ children }) {
  const { props, url } = usePage()
  const user = props.auth?.user

  const [showDropdown, setShowDropdown] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (!user) {
      router.visit(route('login'))
    }
  }, [user])

  const path = (url ?? '').split('?')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-[#0E5C17] transition-transform lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <div className="text-lg font-bold leading-tight text-white">JRB Oyo</div>
            <div className="text-[11px] uppercase tracking-wider text-green-200">State API Console</div>
          </div>
          <button className="text-green-100 lg:hidden" onClick={() => setShowSidebar(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="space-y-5 px-3 pb-8">
          {NAV.map((section, index) => (
            <div key={section.group ?? index}>
              {section.group && (
                <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-green-300/70">
                  {section.group}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    current={path}
                    onNavigate={() => setShowSidebar(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {showSidebar && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <button className="text-gray-600 lg:hidden" onClick={() => setShowSidebar(true)}>
            <FaBars className="text-xl" />
          </button>

          <div className="hidden text-sm text-gray-500 lg:block">Oyo State Joint Revenue Board</div>

          <div className="relative">
            <button className="flex items-center gap-2" onClick={() => setShowDropdown((v) => !v)}>
              <FaUserCircle className="text-2xl text-[#0E7F1B]" />
              <span className="text-sm text-gray-700">{user?.name || 'Guest'}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50">
                  Profile
                </Link>
                <Link
                  href={route('logout')}
                  method="post"
                  as="button"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50"
                >
                  Logout
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
