import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

const ORG_CATEGORIES = [
  { label: 'Business Name', value: '1' },
  { label: 'Company', value: '2' },
  { label: 'Incorporated Trustee', value: '3' },
  { label: 'Limited Partnership', value: '4' },
  { label: 'Limited Reliability Partnership', value: '5' },
];

export default function ResolveCac() {
  const [cacRegNo, setCacRegNo] = useState('');
  const [type, setType] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleResolve = async () => {
    if (!cacRegNo.trim()) {
      toast.error('Please enter a CAC registration number');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/jtb/resolve-non-individual-cac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ cacRegNo, type }),
      });

      const data = await res.json();

      if (res.ok && data?.success !== false) {
        setResult(data);
        toast.success('CAC resolved successfully');
      } else {
        toast.error(data?.message || 'CAC resolution failed');
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
      <Head title="Resolve CAC" />
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
            CAC Resolution for TaxID Retrieval (Non-Individual)
          </h2>

          <div className="mb-4">
            <label htmlFor="cacRegNo" className="block text-sm font-medium text-gray-700 mb-2">
              CAC Registration Number
            </label>
            <input
              id="cacRegNo"
              type="text"
              value={cacRegNo}
              onChange={(e) => setCacRegNo(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="e.g. 7685342"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Category
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
            >
              {ORG_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResolve}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Resolving...' : 'Resolve CAC'}
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
