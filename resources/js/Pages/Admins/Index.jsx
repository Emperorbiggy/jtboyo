import React, { useMemo, useState } from 'react'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { FaPlus, FaSearch, FaUserShield, FaUsers, FaUserCheck, FaPen, FaTrash, FaBan, FaCheck, FaRandom } from 'react-icons/fa'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import Modal from '@/Components/Modal'
import toast from 'react-hot-toast'

const EMPTY = { name: '', email: '', password: '', is_super_admin: false, permissions: [] }

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  const values = crypto.getRandomValues(new Uint32Array(14))
  return Array.from(values, (v) => chars[v % chars.length]).join('')
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="rounded-md bg-green-100 p-2.5">
        <Icon className="text-lg text-[#0E7F1B]" />
      </div>
      <div>
        <div className="text-2xl font-bold leading-none text-gray-900">{value}</div>
        <div className="mt-1 text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function InputField({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  )
}

/* -------------------------------------------------------------------------
 | Add / edit form
 * ---------------------------------------------------------------------- */

function AdminForm({ admin, groups, canManageSuperAdmins, onClose }) {
  const form = useForm(
    admin
      ? { name: admin.name, email: admin.email, password: '', is_super_admin: admin.is_super_admin, permissions: admin.permissions ?? [] }
      : EMPTY
  )
  const { data, setData, errors, processing } = form
  const [showPassword, setShowPassword] = useState(false)

  const toggle = (key) =>
    setData('permissions', data.permissions.includes(key) ? data.permissions.filter((p) => p !== key) : [...data.permissions, key])

  const toggleGroup = (keys) => {
    const allOn = keys.every((k) => data.permissions.includes(k))
    setData('permissions', allOn ? data.permissions.filter((p) => !keys.includes(p)) : [...new Set([...data.permissions, ...keys])])
  }

  const submit = (e) => {
    e.preventDefault()
    const options = { preserveScroll: true, onSuccess: onClose }
    admin ? form.put(route('admins.update', admin.id), options) : form.post(route('admins.store'), options)
  }

  const inputClass =
    'w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E7F1B] focus:ring-[#0E7F1B]'

  return (
    <form onSubmit={submit} className="flex max-h-[90vh] flex-col">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{admin ? `Edit ${admin.name}` : 'Add admin'}</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          {admin ? 'Change their details or what they can do.' : 'They sign in with this email and password.'}
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Full name" error={errors.name}>
            <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
          </InputField>
          <InputField label="Email" error={errors.email}>
            <input type="email" className={inputClass} value={data.email} onChange={(e) => setData('email', e.target.value)} required />
          </InputField>
          <div className="sm:col-span-2">
            <InputField
              label={admin ? 'New password' : 'Password'}
              error={errors.password}
              hint={admin ? 'Leave blank to keep their current password.' : 'At least 8 characters. Share it with them securely.'}
            >
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} font-mono`}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required={!admin}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setData('password', randomPassword())
                    setShowPassword(true)
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FaRandom className="text-xs" /> Generate
                </button>
              </div>
            </InputField>
          </div>
        </div>

        {canManageSuperAdmins && (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-gray-300 text-[#0E7F1B] focus:ring-[#0E7F1B]"
              checked={data.is_super_admin}
              onChange={(e) => setData('is_super_admin', e.target.checked)}
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Super admin</span>
              <span className="block text-xs text-gray-500">Full access to everything, including other super admins.</span>
              {errors.is_super_admin && <span className="mt-1 block text-xs text-rose-600">{errors.is_super_admin}</span>}
            </span>
          </label>
        )}

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Permissions</h3>
            {!data.is_super_admin && (
              <span className="text-xs text-gray-500">{data.permissions.length} selected</span>
            )}
          </div>

          {data.is_super_admin ? (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">Super admins have every permission.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(groups).map(([group, perms]) => {
                const keys = Object.keys(perms)
                const allOn = keys.every((k) => data.permissions.includes(k))
                return (
                  <div key={group} className="rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{group}</span>
                      <button type="button" onClick={() => toggleGroup(keys)} className="text-xs font-medium text-[#0E7F1B] hover:underline">
                        {allOn ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="space-y-1 p-2">
                      {Object.entries(perms).map(([key, label]) => (
                        <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded px-1.5 py-1 text-sm text-gray-700 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#0E7F1B] focus:ring-[#0E7F1B]"
                            checked={data.permissions.includes(key)}
                            onChange={() => toggle(key)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {errors.permissions && <span className="mt-1 block text-xs text-rose-600">{errors.permissions}</span>}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
        <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing}
          className="rounded-md bg-[#0E7F1B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b6a16] disabled:opacity-50"
        >
          {processing ? 'Saving…' : admin ? 'Save changes' : 'Add admin'}
        </button>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------
 | Page
 * ---------------------------------------------------------------------- */

export default function AdminsIndex({ admins, groups, canManageSuperAdmins }) {
  const { props } = usePage()
  const me = props.auth?.user
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // null closed, {} new, admin object for edit
  const [confirm, setConfirm] = useState(null) // { type: 'delete' | 'status', admin }

  const labels = useMemo(() => Object.assign({}, ...Object.values(groups)), [groups])
  const totalPermissions = Object.keys(labels).length

  const filtered = admins.filter((a) => `${a.name} ${a.email}`.toLowerCase().includes(query.trim().toLowerCase()))

  const canTouch = (admin) => canManageSuperAdmins || !admin.is_super_admin

  const runConfirm = () => {
    const { type, admin } = confirm
    const options = {
      preserveScroll: true,
      onFinish: () => setConfirm(null),
      onError: (errors) => Object.values(errors).forEach((m) => toast.error(m)),
    }
    type === 'delete'
      ? router.delete(route('admins.destroy', admin.id), options)
      : router.patch(route('admins.status', admin.id), {}, options)
  }

  return (
    <>
      <Head title="Admins" />
      <DashboardLayout>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader title="Admins" section="Administration" />
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 rounded-md bg-[#0E7F1B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0b6a16]"
          >
            <FaPlus className="text-xs" /> Add admin
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat icon={FaUsers} label="Admins" value={admins.length} />
          <Stat icon={FaUserCheck} label="Active" value={admins.filter((a) => a.is_active).length} />
          <Stat icon={FaUserShield} label="Super admins" value={admins.filter((a) => a.is_super_admin).length} />
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-3">
            <div className="relative max-w-sm">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-md border-gray-300 pl-8 text-sm focus:border-[#0E7F1B] focus:ring-[#0E7F1B]"
              />
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {filtered.map((admin) => {
              const self = admin.id === me?.id
              const editable = canTouch(admin)
              const perms = admin.permissions ?? []

              return (
                <li key={admin.id} className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center ${admin.is_active ? '' : 'bg-gray-50/70'}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                        admin.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {initials(admin.name) || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`truncate font-medium ${admin.is_active ? 'text-gray-900' : 'text-gray-500'}`}>{admin.name}</span>
                        {self && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600">You</span>}
                        {admin.is_super_admin && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                            <FaUserShield className="text-[10px]" /> Super admin
                          </span>
                        )}
                        {!admin.is_active && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">Deactivated</span>
                        )}
                      </div>
                      <div className="truncate text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:w-72 sm:justify-end">
                    {admin.is_super_admin ? (
                      <span className="text-xs text-gray-500">All permissions</span>
                    ) : perms.length === 0 ? (
                      <span className="text-xs text-gray-400">No permissions</span>
                    ) : perms.length === totalPermissions ? (
                      <span className="text-xs text-gray-500">All {totalPermissions} permissions</span>
                    ) : (
                      <>
                        {perms.slice(0, 2).map((p) => (
                          <span key={p} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
                            {labels[p] ?? p}
                          </span>
                        ))}
                        {perms.length > 2 && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500" title={perms.map((p) => labels[p] ?? p).join(', ')}>
                            +{perms.length - 2} more
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      title="Edit"
                      disabled={!editable}
                      onClick={() => setEditing(admin)}
                      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <FaPen className="text-sm" />
                    </button>
                    <button
                      title={admin.is_active ? 'Deactivate' : 'Activate'}
                      disabled={!editable || self}
                      onClick={() => setConfirm({ type: 'status', admin })}
                      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {admin.is_active ? <FaBan className="text-sm" /> : <FaCheck className="text-sm" />}
                    </button>
                    <button
                      title="Remove"
                      disabled={!editable || self}
                      onClick={() => setConfirm({ type: 'delete', admin })}
                      className="rounded-md p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </li>
              )
            })}
            {filtered.length === 0 && <li className="px-4 py-10 text-center text-sm text-gray-500">No admins match “{query}”.</li>}
          </ul>
        </div>

        <Modal show={editing !== null} onClose={() => setEditing(null)} maxWidth="2xl">
          {editing !== null && (
            <AdminForm
              key={editing.id ?? 'new'}
              admin={editing.id ? editing : null}
              groups={groups}
              canManageSuperAdmins={canManageSuperAdmins}
              onClose={() => setEditing(null)}
            />
          )}
        </Modal>

        <Modal show={confirm !== null} onClose={() => setConfirm(null)} maxWidth="md">
          {confirm && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {confirm.type === 'delete' ? 'Remove admin?' : confirm.admin.is_active ? 'Deactivate admin?' : 'Activate admin?'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {confirm.type === 'delete'
                  ? `${confirm.admin.name} will lose access and their account will be deleted. This cannot be undone.`
                  : confirm.admin.is_active
                    ? `${confirm.admin.name} will be signed out and won’t be able to sign in until reactivated.`
                    : `${confirm.admin.name} will be able to sign in again with their existing permissions.`}
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setConfirm(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={runConfirm}
                  className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
                    confirm.type === 'delete' || confirm.admin.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0E7F1B] hover:bg-[#0b6a16]'
                  }`}
                >
                  {confirm.type === 'delete' ? 'Remove' : confirm.admin.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}
