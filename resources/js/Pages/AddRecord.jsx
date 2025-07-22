import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';

const basePath = '/app/public';

export default function AddRecord() {
  const [form, setForm] = useState({
    jtb_tin: '',
    tcc_number: '',
    tax_period: '',
    turnover: '',
    assessable_profit: '',
    total_profit: '',
    tax_payable: '',
    tax_paid: '',
    payment_date: '',
    tax_type: '',
    tax_authority: '',
    tax_office: '',
    EmployerName: '',
    TaxPayerAddress: '',
    TaxPayerName: '',
    Sourceofincome: '',
    expirydate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post('/app/public/api/jtb/add-tax-record', form);
      setMessage({ type: 'success', text: 'Record submitted successfully!' });
      setForm({
        jtb_tin: '',
        tcc_number: '',
        tax_period: 'jan 2019 - Dec 2019',
        turnover: '',
        assessable_profit: '',
        total_profit: '',
        tax_payable: '',
        tax_paid: '',
        payment_date: '',
        tax_type: '',
        tax_authority: '',
        tax_office: '',
        EmployerName: '',
        TaxPayerAddress: '',
        TaxPayerName: '',
        Sourceofincome: '',
        expirydate: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred while submitting.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head title="Add Tax Record" />
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-green-800">Add Tax Record</h1>
          <button
            onClick={() => window.location.href = `${basePath}/dashboard`}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['jtb_tin', 'JTB TIN *'],
              ['tcc_number', 'TCC Number *'],
              ['tax_period', 'Tax Period *'],
              ['turnover', 'Turnover *'],
              ['assessable_profit', 'Assessable Profit *'],
              ['total_profit', 'Total Profit *'],
              ['tax_payable', 'Tax Payable *'],
              ['tax_paid', 'Tax Paid *'],
              ['tax_type', 'Tax Type *'],
              ['tax_authority', 'Tax Authority *'],
              ['tax_office', 'Tax Office'],
              ['EmployerName', 'Employer Name *'],
              ['TaxPayerAddress', 'Taxpayer Address *'],
              ['TaxPayerName', 'Taxpayer Name *'],
              ['Sourceofincome', 'Source of Income *'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required={label.includes('*')}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input
                type="date"
                name="payment_date"
                value={form.payment_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TCC Expiry Date *</label>
              <input
                type="date"
                name="expirydate"
                value={form.expirydate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Record'}
            </button>
          </div>
        </form>
      </DashboardLayout>
    </>
  );
}
