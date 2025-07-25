import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyTin() {
  const [type, setType] = useState('individual'); // 'individual' or 'non-individual'
  const [tin, setTin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!tin.trim()) {
      toast.error('Please enter a TIN');
      return;
    }

    setLoading(true);
    setResult(null);

    const endpoint =
      type === 'individual'
        ? '/api/jtb/verify-individual-tin'
        : '/api/jtb/verify-non-individual-tin';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ tin }),
      });

      const data = await res.json();

      if (res.ok && data?.ResponseCode === '001') {
        setResult(data);
        toast.success('Verification successful');
      } else {
        toast.error(data?.ResponseDescription || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Verify TIN" />
      <Toaster position="top-right" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/dashboard"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded transition ${
                type === 'individual'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setType('individual')}
            >
              Individual TIN
            </button>
            <button
              className={`px-4 py-2 rounded transition ${
                type === 'non-individual'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setType('non-individual')}
            >
              Non-Individual TIN
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded shadow p-6">
          <div className="mb-4">
            <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-2">
              Enter {type === 'individual' ? 'Individual' : 'Non-Individual'} TIN:
            </label>
            <input
              id="tin"
              type="text"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Enter TIN here..."
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify TIN'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded text-sm">
            <h3 className="font-semibold text-green-800 mb-2">Verification Result:</h3>
            <pre className="whitespace-pre-wrap text-gray-700 text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
