import React, { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import { Field, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

export default function TaxIdVerification() {
  const [taxId, setTaxId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Pre-fill when arriving from a completed registration.
  useEffect(() => {
    const carried = new URLSearchParams(window.location.search).get('taxId')
    if (carried) setTaxId(carried)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { status, body } = await postJrb('/taxid/verify', { taxId })
    setResult(interpret(status, body))
    setLoading(false)
  }

  return (
    <>
      <Head title="Tax ID Verification" />
      <DashboardLayout>
        <PageHeader
          title="Tax ID Verification"
          section="Verify"
          description="Verify an existing Tax ID and confirm the taxpayer it belongs to. A successful response returns the taxpayer's name and type."
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="Tax ID" columns={1}>
            <Field
              name="taxId"
              label="Tax ID"
              required
              value={taxId}
              onChange={(_, value) => setTaxId(value)}
              placeholder="2513706419967"
            />
          </Section>

          <SubmitButton loading={loading}>Verify Tax ID</SubmitButton>
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
