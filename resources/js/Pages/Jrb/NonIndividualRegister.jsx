import React, { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeader from '@/Components/Jrb/PageHeader'
import ResultPanel from '@/Components/Jrb/ResultPanel'
import LookupSelect from '@/Components/Jrb/LookupSelect'
import { Field, DateField, BoolField, Section, SubmitButton } from '@/Components/Jrb/Form'
import { postJrb, interpret } from '@/lib/jrb'

const EMPTY_DIRECTOR = { directorTaxId: '', name: '', phone: '', email: '', address: '', shares: '' }

const EMPTY = {
  organizationTypeId: '',
  registrationNumber: '',
  phoneNumber1: '',
  phoneNumber2: '',
  emailAddress: '',
  businessSector: '',
  lineOfBusinessCode: '',
  commencementDate: '',
  dateOfIncorporation: '',
  isExporter: false,
  isImporter: false,
  isLandlord: false,
  countryCode: '',
  stateCode: '',
  lgaCode: '',
  city: '',
  streetName: '',
  houseNumber: '',
  poBox: '',
  postalCode: '',
  fiscalYearStart: '',
  fiscalYearEnd: '',
  shareCapital: '',
}

export default function NonIndividualRegister() {
  const [form, setForm] = useState(EMPTY)
  const [directors, setDirectors] = useState([{ ...EMPTY_DIRECTOR }])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [raw, setRaw] = useState()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const carried = {}

    for (const key of ['registrationNumber', 'organizationTypeId']) {
      const value = params.get(key)
      if (value) carried[key] = value
    }

    if (Object.keys(carried).length > 0) {
      setForm((f) => ({ ...f, ...carried }))
    }
  }, [])

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const setDirector = (index, field, value) =>
    setDirectors((list) => list.map((d, i) => (i === index ? { ...d, [field]: value } : d)))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    // businessSector only narrows the line-of-business list; it is not a JRB field.
    const { businessSector, ...fields } = form

    const payload = {
      ...fields,
      organizationTypeId: Number(fields.organizationTypeId) || 0,
      shareCapital: Number(fields.shareCapital) || 0,
      directors,
    }

    const { status, body } = await postJrb('/non-individual/register', payload)
    setRaw(body)
    setResult(interpret(status, body))
    setLoading(false)
  }

  return (
    <>
      <Head title="Non-Individual Registration" />
      <DashboardLayout>
        <PageHeader
          title="Non-Individual — Complete New Registration"
          section="Second-Level"
          method="POST"
          endpoint="/api/v1/NonIndividual/second-level/taxid/complete-new-registration"
          description="Finish registering a company whose First-Level Lookup returned 202. Run the lookup first — calling this directly returns status 003."
        />

        <form onSubmit={submit} className="space-y-5">
          <Section title="Entity" columns={3}>
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
            <Field
              name="registrationNumber"
              label="CAC registration number"
              required
              value={form.registrationNumber}
              onChange={set}
              hint="The number used in the lookup"
            />
            <Field
              name="shareCapital"
              label="Share capital"
              required
              type="number"
              value={form.shareCapital}
              onChange={set}
            />
            <LookupSelect
              path="/lookups/business-sectors"
              name="businessSector"
              label="Business sector"
              value={form.businessSector}
              onChange={(name, value) => {
                set(name, value)
                set('lineOfBusinessCode', '')
              }}
              valueKey="sectorCode"
              labelKey="sectorName"
              hint="Optional — narrows the line of business list"
            />
            <LookupSelect
              path={
                form.businessSector
                  ? `/lookups/line-of-business/by-sector/${form.businessSector}`
                  : '/lookups/line-of-business'
              }
              name="lineOfBusinessCode"
              label="Line of business"
              required
              value={form.lineOfBusinessCode}
              onChange={set}
              valueKey="lobCode"
              labelKey="lobName"
            />
          </Section>

          <Section title="Dates" columns={4}>
            <DateField
              name="dateOfIncorporation"
              label="Date of incorporation"
              required
              value={form.dateOfIncorporation}
              onChange={set}
            />
            <DateField
              name="commencementDate"
              label="Commencement date"
              required
              value={form.commencementDate}
              onChange={set}
            />
            <DateField
              name="fiscalYearStart"
              label="Fiscal year start"
              required
              format="dd/MM"
              value={form.fiscalYearStart}
              onChange={set}
            />
            <DateField
              name="fiscalYearEnd"
              label="Fiscal year end"
              required
              format="dd/MM"
              value={form.fiscalYearEnd}
              onChange={set}
            />
          </Section>

          <Section title="Contact" columns={3}>
            <Field name="phoneNumber1" label="Phone number 1" required value={form.phoneNumber1} onChange={set} />
            <Field name="phoneNumber2" label="Phone number 2" value={form.phoneNumber2} onChange={set} />
            <Field name="emailAddress" label="Email address" type="email" value={form.emailAddress} onChange={set} />
          </Section>

          <Section title="Address" columns={3}>
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
              name="stateCode"
              label="State"
              required
              value={form.stateCode}
              onChange={(name, value) => {
                set(name, value)
                set('lgaCode', '')
              }}
              prefer="code"
            />
            <LookupSelect
              path={form.stateCode ? `/lookups/lgas/by-state/${form.stateCode}` : null}
              name="lgaCode"
              label="LGA"
              required
              value={form.lgaCode}
              onChange={set}
              prefer="code"
              disabled={!form.stateCode}
              disabledHint="Select a state first"
            />
            <Field name="city" label="City" required value={form.city} onChange={set} />
            <Field name="streetName" label="Street name" required value={form.streetName} onChange={set} />
            <Field name="houseNumber" label="House number" required value={form.houseNumber} onChange={set} />
            <Field name="poBox" label="P.O. Box" value={form.poBox} onChange={set} />
            <Field name="postalCode" label="Postal code" value={form.postalCode} onChange={set} />
          </Section>

          <Section title="Status" columns={3}>
            <BoolField name="isExporter" label="Exporter" value={form.isExporter} onChange={set} />
            <BoolField name="isImporter" label="Importer" value={form.isImporter} onChange={set} />
            <BoolField name="isLandlord" label="Landlord" value={form.isLandlord} onChange={set} />
          </Section>

          {/* Directors */}
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0E7F1B]">Directors</h3>
                <p className="mt-1 text-sm text-gray-500">
                  At least one director is required. A real name is required — the literal placeholder
                  &ldquo;string&rdquo; is rejected by the API.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDirectors((list) => [...list, { ...EMPTY_DIRECTOR }])}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#0E7F1B] px-3 py-1.5 text-sm font-medium text-[#0E7F1B] hover:bg-green-50"
              >
                <FaPlus className="text-xs" /> Add director
              </button>
            </div>

            <div className="space-y-4">
              {directors.map((director, index) => (
                <div key={index} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Director {index + 1}
                    </span>
                    {directors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDirectors((list) => list.filter((_, i) => i !== index))}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Field
                      name={`director-${index}-name`}
                      label="Full name"
                      required
                      value={director.name}
                      onChange={(_, value) => setDirector(index, 'name', value)}
                    />
                    <Field
                      name={`director-${index}-directorTaxId`}
                      label="Director Tax ID"
                      value={director.directorTaxId}
                      onChange={(_, value) => setDirector(index, 'directorTaxId', value)}
                    />
                    <Field
                      name={`director-${index}-shares`}
                      label="Shares"
                      value={director.shares}
                      onChange={(_, value) => setDirector(index, 'shares', value)}
                    />
                    <Field
                      name={`director-${index}-phone`}
                      label="Phone"
                      value={director.phone}
                      onChange={(_, value) => setDirector(index, 'phone', value)}
                    />
                    <Field
                      name={`director-${index}-email`}
                      label="Email"
                      type="email"
                      value={director.email}
                      onChange={(_, value) => setDirector(index, 'email', value)}
                    />
                    <Field
                      name={`director-${index}-address`}
                      label="Address"
                      value={director.address}
                      onChange={(_, value) => setDirector(index, 'address', value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

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
