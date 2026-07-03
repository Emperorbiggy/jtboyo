import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

export default function ResolveNin() {
  const [form, setForm] = useState({
    nin: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResolve = async () => {
    if (!form.nin.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/jtb/resolve-individual-nin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data?.success !== false) {
        setResult(data);
        toast.success('NIN resolved successfully');
      } else {
        toast.error(data?.message || 'NIN resolution failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during resolution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Resolve NIN" />
      <Toaster position="top-right" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="w-full max-w-lg mx-auto bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">
            NIN Resolution for TaxID Retrieval (Individual)
          </h2>

          <div className="mb-4">
            <label htmlFor="nin" className="block text-sm font-medium text-gray-700 mb-2">
              NIN
            </label>
            <input
              id="nin"
              name="nin"
              type="text"
              value={form.nin}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="e.g. 2249393922"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="e.g. Abubakar"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="e.g. Gbenga"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
            />
          </div>

          <button
            onClick={handleResolve}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Resolving...' : 'Resolve NIN'}
          </button>
        </div>

        {result && (
          <div className="mt-8 w-full max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 border border-green-300 overflow-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Resolution Result</h3>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
