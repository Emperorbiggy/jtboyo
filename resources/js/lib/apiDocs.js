/**
 * Endpoint reference for the public /developers page.
 *
 * Field lists mirror the validation rules in JtbController, which the
 * /api/v1 routes share with the operator console. Keep them in step.
 * Fields are [name, type, required, description].
 */

export const LOOKUPS = [
  ['/lookups/organization-types', 'Organisation types (organizationTypeId)'],
  ['/lookups/business-sectors', 'Business sectors'],
  ['/lookups/line-of-business', 'All lines of business (lineOfBusinessCode)'],
  ['/lookups/line-of-business/by-sector/{sectorCode}', 'Lines of business in one sector'],
  ['/lookups/tax-authority/by-state/{stateCode}', 'Tax authority for a state'],
  ['/lookups/titles', 'Titles (titleId)'],
  ['/lookups/genders', 'Genders (genderId)'],
  ['/lookups/states', 'States (stateCode, stateOfOriginCode, stateOfResidenceCode)'],
  ['/lookups/lgas/by-state/{stateCode}', 'LGAs in a state (lgaCode)'],
  ['/lookups/occupations', 'Occupations (occupationId)'],
  ['/lookups/marital-statuses', 'Marital statuses (maritalStatusId)'],
  ['/lookups/nationalities', 'Nationalities (nationalityCode)'],
  ['/lookups/countries', 'Countries (countryCode)'],
]

const DATE = 'string · dd/MM/yyyy'

export const ENDPOINTS = [
  {
    id: 'verify-taxid',
    group: 'Verify',
    title: 'Verify a Tax ID',
    method: 'POST',
    path: '/taxid/verify',
    summary:
      'Confirm that a Tax ID exists and see who it belongs to. Works the same for individuals and organisations.',
    fields: [['taxId', 'string', true, 'The Tax ID to verify.']],
    body: { taxId: '2513706419967' },
    responses: [
      {
        status: 200,
        label: 'Verified',
        body: { statusCode: '200', message: 'Tax ID verified successfully', taxId: '2513706419967' },
      },
      {
        status: 404,
        label: 'Not found',
        body: { success: false, message: 'Record not found', status: 404, data: null },
      },
    ],
  },
  {
    id: 'individual-lookup',
    group: 'Individuals',
    title: 'Individual Tax ID lookup',
    method: 'POST',
    path: '/individual/lookup',
    summary:
      'Find an individual’s Tax ID from their NIN. The names and date of birth must match the NIN record. ' +
      'Run this before Complete registration — registering without a prior lookup returns status 003.',
    fields: [
      ['nin', 'string · 11 digits', true, 'National Identification Number.'],
      ['firstName', 'string', true, 'As on the NIN record.'],
      ['lastName', 'string', true, 'As on the NIN record.'],
      ['dateOfBirth', DATE, true, 'As on the NIN record.'],
    ],
    body: { nin: '54673205375', firstName: 'Ayodeji', lastName: 'Ajayi', dateOfBirth: '10/04/1999' },
    responses: [
      {
        status: 200,
        label: 'Found',
        body: { success: true, message: 'Tax ID found', status: 200, data: { tax_id: '2513706419967' } },
      },
      {
        status: 404,
        label: 'Not found',
        body: { success: false, message: 'Record not found', status: 404, data: { source: 'external_verify' } },
      },
    ],
  },
  {
    id: 'individual-register',
    group: 'Individuals',
    title: 'Complete individual registration',
    method: 'POST',
    path: '/individual/register',
    live: true,
    summary:
      'Complete the taxpayer record for an individual and issue a Tax ID. Use the reference data endpoints ' +
      'for every *Id and *Code field. The NIN must have been through Individual lookup first.',
    fields: [
      ['nin', 'string · 11 digits', true, 'Same NIN used in the lookup.'],
      ['bvn', 'string', false, 'Bank Verification Number.'],
      ['titleId', 'integer', true, 'From /lookups/titles.'],
      ['firstName', 'string', true, ''],
      ['middleName', 'string', false, ''],
      ['lastName', 'string', true, ''],
      ['genderId', 'integer', true, 'From /lookups/genders.'],
      ['dateOfBirth', DATE, true, ''],
      ['maidenName', 'string', false, ''],
      ['occupationId', 'integer', true, 'From /lookups/occupations.'],
      ['maritalStatusId', 'integer', true, 'From /lookups/marital-statuses.'],
      ['nationalityCode', 'string', true, 'From /lookups/nationalities.'],
      ['stateOfOriginCode', 'string', true, 'From /lookups/states.'],
      ['nextOfKin', 'string', false, ''],
      ['phoneNumber1', 'string', true, ''],
      ['phoneNumber2', 'string', false, ''],
      ['email', 'string · email', false, ''],
      ['countryCode', 'string', true, 'From /lookups/countries.'],
      ['stateOfResidenceCode', 'string', true, 'From /lookups/states.'],
      ['lgaCode', 'string', true, 'From /lookups/lgas/by-state/{stateCode}.'],
      ['city', 'string', true, ''],
      ['street', 'string', true, ''],
      ['houseNumber', 'string', true, ''],
      ['isResident', 'boolean', true, ''],
      ['isExporter', 'boolean', true, ''],
      ['isImporter', 'boolean', true, ''],
      ['taxpayerPhoto', 'string · base64 JPEG', false, 'Passport photograph. Keep it under ~200 KB.'],
    ],
    body: {
      nin: '54673205375',
      titleId: 1,
      firstName: 'Ayodeji',
      lastName: 'Ajayi',
      genderId: 1,
      dateOfBirth: '10/04/1999',
      occupationId: 12,
      maritalStatusId: 1,
      nationalityCode: 'NG',
      stateOfOriginCode: 'OY',
      phoneNumber1: '08030000000',
      email: 'ayodeji@example.com',
      countryCode: 'NG',
      stateOfResidenceCode: 'OY',
      lgaCode: 'IBN',
      city: 'Ibadan',
      street: 'Ring Road',
      houseNumber: '12',
      isResident: true,
      isExporter: false,
      isImporter: false,
    },
    responses: [
      {
        status: 200,
        label: '000 · Completed',
        body: { status: '000', message: 'Registration completed successfully', taxId: '2513706419967' },
      },
      {
        status: 200,
        label: '003 · Lookup first',
        body: { status: '003', message: 'First-level lookup is required before registration' },
      },
    ],
  },
  {
    id: 'non-individual-lookup',
    group: 'Organisations',
    title: 'Organisation Tax ID lookup',
    method: 'POST',
    path: '/non-individual/lookup',
    summary:
      'Find a company, business name or incorporated trustee’s Tax ID from its CAC registration number. ' +
      'A 202 means the Tax ID exists but the corporate record is incomplete — follow up with Complete registration.',
    fields: [
      ['regNo', 'string', true, 'CAC registration number, e.g. RC1504347. (Formerly cacRegNo.)'],
      ['organizationTypeId', 'integer', true, 'From /lookups/organization-types. Must match the CAC record.'],
    ],
    body: { regNo: 'RC1504347', organizationTypeId: 12 },
    responses: [
      {
        status: 202,
        label: 'Record incomplete',
        body: {
          success: true,
          message: 'Tax ID found but corporate record incomplete.',
          status: 202,
          data: { regNo: 'RC1504347', next_step: 'complete_registration' },
        },
      },
      {
        status: 400,
        label: 'Mismatch',
        body: {
          success: false,
          message: 'Identity details mismatch. Mismatch fields: OrganizationType',
          status: 400,
          data: { source: 'internal_verify' },
        },
      },
    ],
  },
  {
    id: 'non-individual-register',
    group: 'Organisations',
    title: 'Complete organisation registration',
    method: 'POST',
    path: '/non-individual/register',
    live: true,
    summary:
      'Complete the corporate record, directors included, and issue a Tax ID. The registration number must have ' +
      'been through Organisation lookup first.',
    fields: [
      ['organizationTypeId', 'integer', true, 'From /lookups/organization-types.'],
      ['registrationNumber', 'string', true, 'The CAC number used in the lookup.'],
      ['phoneNumber1', 'string', true, ''],
      ['phoneNumber2', 'string', false, ''],
      ['emailAddress', 'string · email', false, ''],
      ['lineOfBusinessCode', 'string', true, 'From /lookups/line-of-business.'],
      ['commencementDate', DATE, true, ''],
      ['dateOfIncorporation', DATE, true, ''],
      ['fiscalYearStart', 'string · dd/MM', true, 'e.g. 01/01'],
      ['fiscalYearEnd', 'string · dd/MM', true, 'e.g. 31/12'],
      ['shareCapital', 'number', true, ''],
      ['isExporter', 'boolean', true, ''],
      ['isImporter', 'boolean', true, ''],
      ['isLandlord', 'boolean', true, ''],
      ['countryCode', 'string', true, 'From /lookups/countries.'],
      ['stateCode', 'string', true, 'From /lookups/states.'],
      ['lgaCode', 'string', true, 'From /lookups/lgas/by-state/{stateCode}.'],
      ['city', 'string', true, ''],
      ['streetName', 'string', true, ''],
      ['houseNumber', 'string', true, ''],
      ['poBox', 'string', false, ''],
      ['postalCode', 'string', false, ''],
      ['directors', 'array', true, 'At least one director.'],
      ['directors[].name', 'string', true, 'Full name.'],
      ['directors[].directorTaxId', 'string', false, ''],
      ['directors[].phone', 'string', false, ''],
      ['directors[].email', 'string · email', false, ''],
      ['directors[].address', 'string', false, ''],
      ['directors[].shares', 'string', false, ''],
    ],
    body: {
      organizationTypeId: 12,
      registrationNumber: 'RC1504347',
      phoneNumber1: '08030000000',
      emailAddress: 'info@example.com',
      lineOfBusinessCode: 'LOB001',
      commencementDate: '01/02/2020',
      dateOfIncorporation: '15/01/2020',
      fiscalYearStart: '01/01',
      fiscalYearEnd: '31/12',
      shareCapital: 1000000,
      isExporter: false,
      isImporter: false,
      isLandlord: false,
      countryCode: 'NG',
      stateCode: 'OY',
      lgaCode: 'IBN',
      city: 'Ibadan',
      streetName: 'Ring Road',
      houseNumber: '12',
      directors: [{ name: 'Ayodeji Ajayi', phone: '08030000000', shares: '60%' }],
    },
    responses: [
      {
        status: 200,
        label: '000 · Completed',
        body: { status: '000', message: 'Registration completed successfully', taxId: '2513706419967' },
      },
      {
        status: 200,
        label: '001 · Already registered',
        body: { status: '001', message: 'Taxpayer already registered' },
      },
    ],
  },
  {
    id: 'cooperative-resolve',
    group: 'Resolve',
    title: 'Resolve a cooperative',
    method: 'POST',
    path: '/cooperative/resolve',
    summary: 'Find the Tax ID of a registered cooperative society.',
    fields: [
      ['regNo', 'string', true, 'Cooperative registration number.'],
      ['stateCode', 'string', true, 'From /lookups/states.'],
      ['dateOfIncorporation', DATE, true, ''],
    ],
    body: { regNo: 'COOP/OY/1234', stateCode: 'OY', dateOfIncorporation: '15/01/2015' },
    responses: [
      {
        status: 200,
        label: 'Resolved',
        body: { statusCode: '200', message: 'Cooperative resolved', taxId: '2513706419967' },
      },
    ],
  },
  {
    id: 'mda-resolve',
    group: 'Resolve',
    title: 'Resolve an MDA',
    method: 'POST',
    path: '/mda/resolve',
    summary: 'Find the Tax ID of a state or federal Ministry, Department or Agency.',
    fields: [
      ['source', 'string', true, '"mda" for a state MDA, "fed_mda" for a federal one.'],
      ['Org_No', 'string', true, 'Organisation number. Note the capitalisation.'],
    ],
    body: { source: 'fed_mda', Org_No: '1016543090' },
    responses: [
      {
        status: 404,
        label: 'Not found',
        body: { message: 'No matching MDA taxpayer found', statusCode: '404' },
      },
    ],
  },
  {
    id: 'lookups',
    group: 'Reference data',
    title: 'Reference data',
    method: 'GET',
    path: '/lookups/organization-types',
    summary:
      'Code lists for the *Id and *Code fields above. They change rarely, so cache them on your side ' +
      'rather than fetching them before every request.',
    lookups: true,
    responses: [
      {
        status: 200,
        label: 'Organisation types',
        body: {
          success: true,
          data: [
            { id: 12, orgName: 'BUSINESS NAME', registerWithCac: true },
            { id: 3, orgName: 'INCORPORATED TRUSTEE', registerWithCac: true },
          ],
        },
      },
    ],
  },
  {
    id: 'legacy-verify-tin',
    group: 'Legacy',
    title: 'Verify TIN (legacy)',
    method: 'POST',
    path: '/verify-tin',
    summary:
      'Kept for integrations built against the original JTB API. New integrations should use Verify a Tax ID.',
    fields: [
      ['type', 'string', true, '"individual" or "non-individual".'],
      ['tin', 'string', true, 'The Tax ID to verify.'],
    ],
    body: { type: 'individual', tin: '2513706419967' },
    responses: [
      {
        status: 200,
        label: 'Verified',
        body: { statusCode: '200', message: 'Tax ID verified successfully', taxId: '2513706419967' },
      },
    ],
  },
]

export const HTTP_ERRORS = [
  [401, 'Missing, unknown or disabled API key.', '{ "error": "Invalid or inactive token." }'],
  [403, 'The request came from an IP address not on your key’s whitelist.', '{ "error": "Your IP address is not whitelisted." }'],
  [422, 'A field failed validation before the request reached JRB.', '{ "message": "…", "errors": { "taxId": ["The tax id field is required."] } }'],
  [400, 'JRB rejected the details, e.g. a name or organisation type mismatch.', '{ "success": false, "message": "Identity details mismatch…" }'],
  [404, 'JRB has no matching record.', '{ "success": false, "message": "Record not found" }'],
  [503, 'We could not reach or sign in to JRB. Safe to retry after a short wait.', '{ "success": false, "message": "Could not authenticate with the JRB API…" }'],
]

export const REGISTRATION_CODES = [
  ['000', 'Registration completed — the body carries the new taxId.'],
  ['001', 'Taxpayer is already registered.'],
  ['002', 'A required field is missing.'],
  ['003', 'No first-level lookup on record — call the lookup endpoint first.'],
  ['004', 'JRB validation failed — see the error object for the fields.'],
]
