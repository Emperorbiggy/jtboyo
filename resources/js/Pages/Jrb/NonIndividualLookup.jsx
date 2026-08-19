import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import LookupSelect from '@/Components/Jrb/LookupSelect'
import { Field, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

const EMPTY = { cacRegNo: '', organizationTypeId: '' }

export default function NonIndividualLookup() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { status, body } = await postJrb('/non-individual/lookup', {
      cacRegNo: form.cacRegNo,
      organizationTypeId: Number(form.organizationTypeId) || 0,
    })

    setResult(interpret(status, body))
    setLoading(false)
  }

  const continueTo =
    `/jrb/non-individual/register?registrationNumber=${encodeURIComponent(form.cacRegNo)}` +
    `&organizationTypeId=${encodeURIComponent(form.organizationTypeId)}`

  return (
    <>
      <Head title="Non-Individual Tax ID Lookup" />
      <DashboardLayout>
        <PageHeader
          title="Non-Individual — Tax ID Lookup"
          section="First-Level"
          description="Search for a company's Tax ID using its CAC registration number and organisation type. The organisation type must match the entity's actual type, or the API returns a 400 mismatch."
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="Entity identity" columns={2}>
            <Field
              name="cacRegNo"
              label="CAC registration number"
              required
              value={form.cacRegNo}
              onChange={set}
              placeholder="RC1504347"
            />
            <LookupSelect
              path="/lookups/organization-types"
              name="organizationTypeId"
              label="Organisation type"
              required
              value={form.organizationTypeId}
              onChange={set}
              valueKey="id"
              labelKey="orgName"
            />
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
