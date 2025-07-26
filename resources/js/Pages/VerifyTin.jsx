import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyTin() {
  const [type, setType] = useState('individual');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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

        <div className="w-full max-w-lg mx-auto bg-white rounded shadow p-6">
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

        {result && result.Taxpayer && (
          <div className="mt-8 w-full max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 border border-green-300 overflow-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Verification Result</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
              <div><span className="font-medium">TIN:</span> {result.Taxpayer.tin}</div>

              {result.Taxpayer.first_name ? (
                <>
                  <div><span className="font-medium">First Name:</span> {result.Taxpayer.first_name}</div>
                  <div><span className="font-medium">Middle Name:</span> {result.Taxpayer.middle_name || 'N/A'}</div>
                  <div><span className="font-medium">Last Name:</span> {result.Taxpayer.last_name}</div>
                  <div><span className="font-medium">Phone:</span> {result.Taxpayer.phone_no}</div>
                  <div><span className="font-medium">Email:</span> {result.Taxpayer.email}</div>
                  <div><span className="font-medium">Date of Birth:</span> {result.Taxpayer.date_of_birth}</div>
                  <div><span className="font-medium">Registration Date:</span> {result.Taxpayer.date_of_registration}</div>
                  <div><span className="font-medium">Tax Authority:</span> {result.Taxpayer.tax_authority}</div>
                  <div><span className="font-medium">Tax Office:</span> {result.Taxpayer.tax_office || 'N/A'}</div>
                </>
              ) : (
                <>
                  <div><span className="font-medium">Registered Name:</span> {result.Taxpayer.registered_name}</div>
                  <div><span className="font-medium">Registration Number:</span> {result.Taxpayer.registration_number}</div>
                  <div><span className="font-medium">Phone:</span> {result.Taxpayer.phone_no}</div>
                  <div><span className="font-medium">Email:</span> {result.Taxpayer.email}</div>
                  <div><span className="font-medium">Date of Incorporation:</span> {result.Taxpayer.date_of_incorporation}</div>
                  <div><span className="font-medium">Date of Registration:</span> {result.Taxpayer.date_of_registration}</div>
                  <div><span className="font-medium">Tax Authority:</span> {result.Taxpayer.tax_authority}</div>
                  <div><span className="font-medium">Tax Office:</span> {result.Taxpayer.tax_office || 'N/A'}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
