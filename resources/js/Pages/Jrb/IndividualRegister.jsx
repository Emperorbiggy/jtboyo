import React, { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import LookupSelect from '@/Components/Jrb/LookupSelect'
import { Field, DateField, BoolField, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

const EMPTY = {
  nin: '',
  bvn: '',
  titleId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  genderId: '',
  stateOfOriginCode: '',
  dateOfBirth: '',
  occupationId: '',
  maritalStatusId: '',
  phoneNumber1: '',
  phoneNumber2: '',
  email: '',
  maidenName: '',
  nextOfKin: '',
  nationalityCode: '',
  isResident: true,
  isExporter: false,
  isImporter: false,
  countryCode: '',
  stateOfResidenceCode: '',
  lgaCode: '',
  city: '',
  street: '',
  houseNumber: '',
  taxpayerPhoto: '',
}

export default function IndividualRegister() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [raw, setRaw] = useState()

  // Pre-fill from the lookup page's "continue" link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const carried = {}

    for (const key of ['nin', 'firstName', 'lastName', 'dateOfBirth']) {
      const value = params.get(key)
      if (value) carried[key] = value
    }

    if (Object.keys(carried).length > 0) {
      setForm((f) => ({ ...f, ...carried }))
    }
  }, [])

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const payload = {
      ...form,
      titleId: Number(form.titleId) || 0,
      genderId: Number(form.genderId) || 0,
      occupationId: Number(form.occupationId) || 0,
      maritalStatusId: Number(form.maritalStatusId) || 0,
    }

    const { status, body } = await postJrb('/individual/register', payload)
    setRaw(body)
    setResult(interpret(status, body))
    setLoading(false)
  }

  return (
    <>
      <Head title="Individual Registration" />
      <DashboardLayout>
        <PageHeader
          title="Individual — Complete New Registration"
          section="Second-Level"
          method="POST"
          endpoint="/api/v1/Individual/second-level/taxid/complete-new-registration"
          description="Finish registering an individual whose First-Level Lookup returned 202. Run the lookup first — calling this directly returns status 003."
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="Identity" columns={3}>
            <Field name="nin" label="NIN" required value={form.nin} onChange={set} maxLength={11} hint="Same NIN used in the lookup" />
            <Field name="bvn" label="BVN" value={form.bvn} onChange={set} />
            <LookupSelect
              path="/lookups/titles"
              name="titleId"
              label="Title"
              required
              value={form.titleId}
              onChange={set}
              prefer="id"
            />
            <Field name="firstName" label="First name" required value={form.firstName} onChange={set} />
            <Field name="middleName" label="Middle name" value={form.middleName} onChange={set} />
            <Field name="lastName" label="Last name" required value={form.lastName} onChange={set} />
            <LookupSelect path="/lookups/genders" name="genderId" label="Gender" required value={form.genderId} onChange={set} />
            <DateField name="dateOfBirth" label="Date of birth" required value={form.dateOfBirth} onChange={set} />
            <Field name="maidenName" label="Maiden name" value={form.maidenName} onChange={set} />
          </Section>

          <Section title="Personal details" columns={3}>
            <LookupSelect
              path="/lookups/occupations"
              name="occupationId"
              label="Occupation"
              required
              value={form.occupationId}
              onChange={set}
            />
            <LookupSelect
              path="/lookups/marital-statuses"
              name="maritalStatusId"
              label="Marital status"
              required
              value={form.maritalStatusId}
              onChange={set}
            />
            <LookupSelect
              path="/lookups/nationalities"
              name="nationalityCode"
              label="Nationality"
              required
              value={form.nationalityCode}
              onChange={set}
              prefer="code"
            />
            <LookupSelect
              path="/lookups/states"
              name="stateOfOriginCode"
              label="State of origin"
              required
              value={form.stateOfOriginCode}
              onChange={set}
              prefer="code"
            />
            <Field name="nextOfKin" label="Next of kin" value={form.nextOfKin} onChange={set} />
            <Field name="taxpayerPhoto" label="Taxpayer photo" value={form.taxpayerPhoto} onChange={set} hint="Base64 string (optional)" />
          </Section>

          <Section title="Contact" columns={3}>
            <Field name="phoneNumber1" label="Phone number 1" required value={form.phoneNumber1} onChange={set} />
            <Field name="phoneNumber2" label="Phone number 2" value={form.phoneNumber2} onChange={set} />
            <Field name="email" label="Email" type="email" value={form.email} onChange={set} />
          </Section>

          <Section title="Residence" columns={3}>
            <LookupSelect
              path="/lookups/countries"
              name="countryCode"
              label="Country"
              required
              value={form.countryCode}
              onChange={set}
              prefer="code"
            />
            <LookupSelect
              path="/lookups/states"
              name="stateOfResidenceCode"
              label="State of residence"
              required
              value={form.stateOfResidenceCode}
              onChange={set}
              prefer="code"
            />
            <LookupSelect
              path={form.stateOfResidenceCode ? `/lookups/lgas/by-state/${form.stateOfResidenceCode}` : null}
              name="lgaCode"
              label="LGA"
              required
              value={form.lgaCode}
              onChange={set}
              prefer="code"
              disabled={!form.stateOfResidenceCode}
              disabledHint="Select a state of residence first"
            />
            <Field name="city" label="City" required value={form.city} onChange={set} />
            <Field name="street" label="Street" required value={form.street} onChange={set} />
            <Field name="houseNumber" label="House number" required value={form.houseNumber} onChange={set} />
          </Section>

          <Section title="Status" columns={3}>
            <BoolField name="isResident" label="Resident" value={form.isResident} onChange={set} />
            <BoolField name="isExporter" label="Exporter" value={form.isExporter} onChange={set} />
            <BoolField name="isImporter" label="Importer" value={form.isImporter} onChange={set} />
          </Section>

          <SubmitButton loading={loading}>Complete registration</SubmitButton>
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
