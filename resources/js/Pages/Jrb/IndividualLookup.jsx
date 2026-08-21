import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import { Field, DateField, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

const EMPTY = { nin: '', firstName: '', lastName: '', dateOfBirth: '' }

export default function IndividualLookup() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { status, body } = await postJrb('/individual/lookup', form)
    setResult(interpret(status, body))
    setLoading(false)
  }

  // Carry the identity across so the registration form starts pre-filled.
  const continueTo =
    `/jrb/individual/register?nin=${encodeURIComponent(form.nin)}` +
    `&firstName=${encodeURIComponent(form.firstName)}` +
    `&lastName=${encodeURIComponent(form.lastName)}` +
    `&dateOfBirth=${encodeURIComponent(form.dateOfBirth)}`

  return (
    <>
      <Head title="Individual Tax ID Lookup" />
      <DashboardLayout>
        <PageHeader
          title="Individual — Tax ID Lookup"
          section="First-Level"
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="Taxpayer identity" columns={2}>
            <Field
              name="nin"
              label="NIN"
              required
              value={form.nin}
              onChange={set}
              maxLength={11}
              inputMode="numeric"
              hint="11 digits"
            />
            <DateField name="dateOfBirth" label="Date of birth" required value={form.dateOfBirth} onChange={set} />
            <Field name="firstName" label="First name" required value={form.firstName} onChange={set} />
            <Field name="lastName" label="Last name" required value={form.lastName} onChange={set} />
          </Section>

          <div className="flex items-center gap-3">
            <SubmitButton loading={loading}>Look up Tax ID</SubmitButton>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY)
                setResult(null)
              }}
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6">
            <ResultPanel result={result} continueTo={continueTo} />
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
