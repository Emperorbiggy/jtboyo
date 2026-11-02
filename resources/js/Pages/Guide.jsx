import React from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import {
  FaSignInAlt,
  FaUser,
  FaBuilding,
  FaHandshake,
  FaLandmark,
  FaIdCard,
  FaUserShield,
  FaKey,
  FaLifeRing,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaLock,
} from 'react-icons/fa'
import DashboardLayout from '@/Layouts/DashboardLayout'

/*
| Operator and administrator handbook for the console. Each section names the
| permission it needs, so readers can tell what they can and cannot open.
*/

const PERMISSION_LABELS = {
  'individual.lookup': 'Individual · Tax ID lookup',
  'individual.register': 'Individual · Complete registration',
  'non_individual.lookup': 'Non-Individual · Tax ID lookup',
  'non_individual.register': 'Non-Individual · Complete registration',
  resolve: 'Resolve cooperatives and MDAs',
  verify: 'Tax ID verification',
  'api_keys.manage': 'Manage partner API keys',
  'admins.manage': 'Manage admins',
}

const SECTIONS = [
  { id: 'start', title: 'Getting started', icon: FaSignInAlt },
  { id: 'results', title: 'Reading results', icon: FaCheckCircle },
  { id: 'individual', title: 'Individuals', icon: FaUser, permissions: ['individual.lookup', 'individual.register'] },
  { id: 'organisation', title: 'Organisations', icon: FaBuilding, permissions: ['non_individual.lookup', 'non_individual.register'] },
  { id: 'cooperative', title: 'Cooperatives', icon: FaHandshake, permissions: ['resolve'] },
  { id: 'mda', title: 'MDAs', icon: FaLandmark, permissions: ['resolve'] },
  { id: 'verify', title: 'Tax ID verification', icon: FaIdCard, permissions: ['verify'] },
  { id: 'admins', title: 'Managing admins', icon: FaUserShield, permissions: ['admins.manage'] },
  { id: 'api-keys', title: 'Partner API keys', icon: FaKey, permissions: ['api_keys.manage'] },
  { id: 'help', title: 'Troubleshooting', icon: FaLifeRing },
]

function Steps({ items }) {
  return (
    <ol className="mt-4 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0E7F1B] text-xs font-semibold text-white">
            {i + 1}
          </span>
          <div className="text-sm leading-relaxed text-gray-700">{item}</div>
        </li>
      ))}
    </ol>
  )
}

function Note({ tone = 'info', children }) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-900',
  }
  return <div className={`mt-4 rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles[tone]}`}>{children}</div>
}

function Table({ head, rows }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 align-top text-gray-700 ${j === 0 ? 'whitespace-nowrap font-medium text-gray-900' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ section, granted, children }) {
  const Icon = section.icon
  const missing = (section.permissions ?? []).filter((p) => !granted.includes(p))

  return (
    <section id={section.id} className="scroll-mt-24 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-md bg-green-100 p-2.5">
          <Icon className="text-lg text-[#0E7F1B]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
      </div>

      {section.permissions && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-500">Needs:</span>
          {section.permissions.map((p) => (
            <span
              key={p}
              className={`rounded-full px-2 py-0.5 ${granted.includes(p) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
            >
              {PERMISSION_LABELS[p]}
            </span>
          ))}
          {missing.length > 0 && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <FaLock className="text-[10px]" /> {missing.length === section.permissions.length ? 'You don’t have this access' : 'You have partial access'}
            </span>
          )}
        </div>
      )}

      <div className="mt-4">{children}</div>
    </section>
  )
}

const P = ({ children }) => <p className="mt-3 text-sm leading-relaxed text-gray-700">{children}</p>
const H3 = ({ children }) => <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">{children}</h3>
const Go = ({ href, children }) => (
  <Link href={href} className="font-medium text-[#0E7F1B] underline-offset-2 hover:underline">
    {children}
  </Link>
)

export default function Guide() {
  const { props } = usePage()
  const granted = props.auth?.permissions ?? []
  const s = Object.fromEntries(SECTIONS.map((x) => [x.id, x]))

  return (
    <>
      <Head title="User Guide" />
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Guide</h1>
          <p className="mt-1 text-sm text-gray-600">
            How to use the JRB State API Console: looking up and registering taxpayers, reading results, and administering
            the platform.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-8">
          {/* Contents */}
          <nav className="mb-6 lg:sticky lg:top-20 lg:mb-0 lg:self-start">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contents</div>
            <ul className="flex flex-wrap gap-1.5 lg:block lg:space-y-0.5">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:border-[#0E7F1B] hover:text-[#0E7F1B] lg:border-0 lg:bg-transparent"
                    >
                      <Icon className="shrink-0 text-xs text-gray-400" />
                      {section.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="min-w-0 space-y-6">
            <Section section={s.start} granted={granted}>
              <P>
                The console connects you directly to the Joint Revenue Board’s production register. Everything you look up is
                live data, and every registration you complete creates a real taxpayer record.
              </P>
              <Steps
                items={[
                  'Sign in with the email and password an administrator gave you. There is no self sign-up — ask an administrator if you need an account.',
                  'Change your password from Profile (top-right menu) the first time you sign in.',
                  'The sidebar and the Overview page only show the tasks you have permission for. If something you need is missing, ask an administrator to grant it.',
                ]}
              />
              <H3>Dates and formats</H3>
              <Table
                head={['Field', 'Format', 'Example']}
                rows={[
                  ['Dates', 'Day/Month/Year', '10/04/1999'],
                  ['Fiscal year start / end', 'Day/Month', '01/01 and 31/12'],
                  ['NIN', '11 digits', '54673205375'],
                  ['CAC number', 'As printed on the certificate', 'RC1504347, BN1234567, IT12345'],
                ]}
              />
            </Section>

            <Section section={s.results} granted={granted}>
              <P>Every action shows a coloured result panel under the form.</P>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  [FaCheckCircle, 'text-green-600', 'Green', 'Success. Copy the Tax ID with the Copy button next to it.'],
                  [FaExclamationTriangle, 'text-amber-500', 'Amber', 'Needs follow-up, e.g. the record is incomplete or already registered.'],
                  [FaTimesCircle, 'text-red-600', 'Red', 'Not found, details don’t match, or JRB had a problem.'],
                ].map(([Icon, color, title, text]) => (
                  <div key={title} className="rounded-lg border border-gray-200 p-4">
                    <Icon className={`text-xl ${color}`} />
                    <div className="mt-2 font-semibold text-gray-900">{title}</div>
                    <p className="mt-1 text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
              <H3>Common results</H3>
              <Table
                head={['You see', 'What it means', 'What to do']}
                rows={[
                  ['Tax ID found', 'The taxpayer already has a complete record.', 'Use the Tax ID shown.'],
                  ['Record incomplete (202)', 'A Tax ID exists but JRB needs more details.', 'Click “Continue to complete registration”.'],
                  ['Identity details mismatch', 'The details don’t match the official record. The panel lists the mismatched fields.', 'Correct those fields and try again.'],
                  ['Not found · Lookup failed (source: external_verify)', 'JRB found no matching record in the external registry (NIMC or CAC) and named no mismatched fields.', 'Check the number, and that the organisation type matches the certificate (e.g. IT numbers are Incorporated Trustees, RC numbers are companies).'],
                  ['000 · Registration completed', 'A new taxpayer record was created.', 'Note the Tax ID issued.'],
                  ['001 · Already registered', 'The taxpayer is already on the register.', 'Run the lookup again to get their Tax ID.'],
                  ['003 · Lookup required first', 'Registration was tried without a lookup.', 'Do the Tax ID lookup step first, then register.'],
                  ['002 / 004', 'A field is missing or JRB rejected a value.', 'Fix the fields listed in the panel.'],
                  ['JRB internal error / unavailable', 'A fault on JRB’s side, not your input.', 'Wait a minute and retry. If it persists, report it with the time shown.'],
                ]}
              />
            </Section>

            <Section section={s.individual} granted={granted}>
              <P>Individuals are a two-step process: look up first, then complete the record if needed.</P>
              <H3>Step 1 · Tax ID lookup</H3>
              <Steps
                items={[
                  <>Open <Go href="/jrb/individual/lookup">Individual → Tax ID Lookup</Go>.</>,
                  'Enter the NIN, first name, last name and date of birth exactly as on the NIN record.',
                  'Submit. If the Tax ID is found you are done. If the record is incomplete, continue to step 2.',
                ]}
              />
              <H3>Step 2 · Complete registration</H3>
              <Steps
                items={[
                  <>Open <Go href="/jrb/individual/register">Individual → Complete Registration</Go>, or use the link on the lookup result.</>,
                  'Use the same NIN as the lookup. Pick title, gender, occupation, state, LGA and so on from the drop-downs.',
                  'Optionally add a passport photograph; it is resized automatically.',
                  'Submit. On 000 the new Tax ID is shown — copy it for the taxpayer.',
                ]}
              />
              <Note tone="warn">Registration writes to the live JRB register. Double-check every field before submitting.</Note>
            </Section>

            <Section section={s.organisation} granted={granted}>
              <P>Companies, business names and incorporated trustees follow the same two steps.</P>
              <H3>Step 1 · Tax ID lookup</H3>
              <Steps
                items={[
                  <>Open <Go href="/jrb/non-individual/lookup">Non-Individual → Tax ID Lookup</Go>.</>,
                  'Enter the CAC registration number and choose the organisation type that matches the certificate.',
                  'Submit. A 202 “record incomplete” result means you should continue to step 2.',
                ]}
              />
              <H3>Step 2 · Complete registration</H3>
              <Steps
                items={[
                  <>Open <Go href="/jrb/non-individual/register">Non-Individual → Complete Registration</Go>.</>,
                  'Use the same registration number and organisation type as the lookup.',
                  'Choose the business sector first to narrow the line-of-business list.',
                  'Fill in dates, fiscal year (dd/mm), share capital and address, then add at least one director.',
                  'Submit and note the Tax ID on a 000 result.',
                ]}
              />
            </Section>

            <Section section={s.cooperative} granted={granted}>
              <Steps
                items={[
                  <>Open <Go href="/jrb/cooperative">Resolve → Cooperative</Go>.</>,
                  'Enter the cooperative registration number, its state and date of incorporation.',
                  'Submit. No prior lookup is needed.',
                ]}
              />
            </Section>

            <Section section={s.mda} granted={granted}>
              <Steps
                items={[
                  <>Open <Go href="/jrb/mdas">Resolve → MDAs</Go>.</>,
                  'Choose State MDA or Federal MDA and enter the organisation number.',
                  'Submit to see the MDA’s Tax ID.',
                ]}
              />
            </Section>

            <Section section={s.verify} granted={granted}>
              <Steps
                items={[
                  <>Open <Go href="/jrb/taxid-verification">Verify → Tax ID Verification</Go>.</>,
                  'Enter the Tax ID and submit to confirm it exists and see who it belongs to.',
                ]}
              />
              <P>After a successful registration, the result offers a shortcut that opens this page with the new Tax ID filled in.</P>
            </Section>

            <Section section={s.admins} granted={granted}>
              <P>
                Admins are the people who can sign in to this console. Each one only sees and can do what their permissions allow —
                the same rules are enforced on the server, so hiding a menu is not the only protection.
              </P>
              <H3>Add an admin</H3>
              <Steps
                items={[
                  <>Open <Go href="/admins">Administration → Admins</Go> and click <strong>Add admin</strong>.</>,
                  'Enter their name and email. Type a password or click Generate, then share it with them securely (not by email in plain text).',
                  'Tick the permissions they need — use “All” on a group to tick the whole group. Give only what their job requires.',
                  'Click Add admin. They can sign in straight away and should change their password from Profile.',
                ]}
              />
              <H3>Permissions</H3>
              <Table
                head={['Permission', 'Allows']}
                rows={[
                  ['Individual · Tax ID lookup', 'Look up individuals by NIN.'],
                  ['Individual · Complete registration', 'Create or complete individual taxpayer records.'],
                  ['Non-Individual · Tax ID lookup', 'Look up organisations by CAC number.'],
                  ['Non-Individual · Complete registration', 'Create or complete organisation records, with directors.'],
                  ['Resolve cooperatives and MDAs', 'Use the Cooperative and MDAs pages.'],
                  ['Tax ID verification', 'Verify existing Tax IDs.'],
                  ['Manage partner API keys', 'Create, edit, disable and delete API keys for consultants and partners.'],
                  ['Manage admins', 'Add, edit, deactivate and remove admins (but not super admins).'],
                  ['Super admin', 'Everything above, plus managing other super admins.'],
                ]}
              />
              <H3>Change, deactivate or remove</H3>
              <Steps
                items={[
                  'Click the pencil to change details or permissions. Leave the password blank to keep their current one.',
                  'Click the ban icon to deactivate. They are signed out and can’t sign in until reactivated; their history is kept. Prefer this when someone leaves or is on long leave.',
                  'Click the bin to remove the account permanently.',
                ]}
              />
              <Note>
                You can’t deactivate or delete your own account, and only a super admin can create, change or remove a super
                admin. Keep at least two super admins so the platform is never left without one.
              </Note>
            </Section>

            <Section section={s['api-keys']} granted={granted}>
              <P>
                Consultants and partner systems use the API instead of this console. Each gets its own key, which only works from
                the IP addresses you allow. The developer documentation is at <Go href="/developers">/developers</Go> — share that
                link with them.
              </P>
              <H3>Issue a key</H3>
              <Steps
                items={[
                  <>Open <Go href="/create-app">Administration → Partner API Apps</Go> and create a new app.</>,
                  'Name it after the consultant or organisation, so its activity is easy to recognise in the logs.',
                  'Enter the public IP addresses their servers call from, separated by commas. Ask them for these — calls from any other IP are refused.',
                  'Save, then copy the key and send it to them securely.',
                ]}
              />
              <H3>Look after keys</H3>
              <Steps
                items={[
                  'One key per consultant or organisation — never share one key between them.',
                  'If a key leaks or a contract ends, disable it. It stops working immediately and can be re-enabled later.',
                  'The request count and “last used” time show whether a key is in use. Full call history is kept for 90 days in the server’s API log.',
                ]}
              />
            </Section>

            <Section section={s.help} granted={granted}>
              <Table
                head={['Problem', 'Fix']}
                rows={[
                  ['A menu item or page is missing, or you see “403 · Not allowed”', 'You don’t have that permission. Ask an administrator.'],
                  ['“This account has been deactivated”', 'An administrator has deactivated your account. Contact them.'],
                  ['Sent back to the sign-in page', 'Your session ended. Sign in again; fill long forms in one sitting.'],
                  ['“Could not authenticate with the JRB API” (503)', 'The server can’t reach or sign in to JRB. Report it to the technical team; it is not caused by your input.'],
                  ['JRB timed out / unreachable', 'JRB is slow or down. Retry after a few minutes.'],
                  ['A consultant gets 401 from the API', 'Their key is wrong or disabled. Check it on Partner API Apps.'],
                  ['A consultant gets 403 from the API', 'They are calling from an IP that isn’t on their key. Add the IP they are using.'],
                  ['Every super admin is locked out', <>On the server run <code className="rounded bg-gray-100 px-1 font-mono text-xs">php artisan admin:super you@example.com</code>.</>],
                ]}
              />
            </Section>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
