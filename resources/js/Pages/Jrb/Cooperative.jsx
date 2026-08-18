import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import LookupSelect from '@/Components/Jrb/LookupSelect'
import { Field, DateField, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

const EMPTY = { regNo: '', stateCode: '', dateOfIncorporation: '' }

export default function Cooperative() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [raw, setRaw] = useState()

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { status, body } = await postJrb('/cooperative/resolve', form)
    setRaw(body)
    setResult(interpret(status, body))
    setLoading(false)
  }

  return (
    <>
      <Head title="Cooperative Tax ID" />
      <DashboardLayout>
        <PageHeader
          title="Cooperative — Tax ID Retrieval"
          section="Resolve"
          method="POST"
          endpoint="/api/Cooporative/resolve"
          description="Resolve a cooperative society's Tax ID from its registration number, state and date of incorporation. This is a resolve endpoint — no prior lookup is required."
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="Cooperative details" columns={3}>
            <Field name="regNo" label="Registration number" required value={form.regNo} onChange={set} />
            <LookupSelect
              path="/lookups/states"
              name="stateCode"
              label="State"
              required
              value={form.stateCode}
              onChange={set}
              prefer="code"
            />
            <DateField
              name="dateOfIncorporation"
              label="Date of incorporation"
              required
              value={form.dateOfIncorporation}
              onChange={set}
            />
          </Section>

          <SubmitButton loading={loading}>Resolve Tax ID</SubmitButton>
        </form>

        {result && (
          <div className="mt-6">
            <ResultPanel result={result} raw={raw} />
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
