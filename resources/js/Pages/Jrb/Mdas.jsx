import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import { Field, Select, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

const SOURCES = [
  { value: 'mda', label: 'State MDA' },
  { value: 'fed_mda', label: 'Federal MDA' },
]

const EMPTY = { source: '', Org_No: '' }

export default function Mdas() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { status, body } = await postJrb('/mda/resolve', form)
    setResult(interpret(status, body))
    setLoading(false)
  }

  return (
    <>
      <Head title="MDA Tax ID" />
      <DashboardLayout>
        <PageHeader
          title="MDAs — Tax ID Retrieval"
          section="Resolve"
          description="Resolve the Tax ID of a Ministry, Department or Agency from its source and organisation number. This is a resolve endpoint — no prior lookup is required."
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="MDA details" columns={2}>
            <Select
              name="source"
              label="Source"
              required
              value={form.source}
              onChange={set}
              options={SOURCES}
              hint="State or Federal MDA"
            />
            <Field name="Org_No" label="Organisation number" required value={form.Org_No} onChange={set} />
          </Section>

          <SubmitButton loading={loading}>Resolve Tax ID</SubmitButton>
        </form>

        {result && (
          <div className="mt-6">
            <ResultPanel result={result} />
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
