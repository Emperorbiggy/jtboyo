import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FaPlusCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AuthAppIndex() {
  const [apps, setApps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ app_name: '', whitelisted_ips: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchApps = async () => {
    try {
      const response = await axios.get('/api/v1/auth-apps');
      setApps(response.data.data);
    } catch (err) {
      toast.error('Failed to load apps');
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/generate-token', form);

      toast.success(response.data.message || 'Token generated successfully!');
      setForm({ app_name: '', whitelisted_ips: '', description: '' });
      setShowModal(false);
      fetchApps(); // refresh list
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.messages;
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Authorized Apps" />
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Authorized Apps</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center gap-2"
          >
            <FaPlusCircle /> New App
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-4">App Name</th>
                <th className="py-2 px-4">Token</th>
                <th className="py-2 px-4">Whitelisted IPs</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Last Access</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{app.app_name}</td>
                  <td className="py-2 px-4 text-xs break-all">{app.token}</td>
                  <td className="py-2 px-4">{app.whitelisted_ips?.join(', ')}</td>
                  <td className="py-2 px-4">{app.status ? 'Active' : 'Inactive'}</td>
                  <td className="py-2 px-4">{app.last_accessed_at || 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold text-green-700 mb-4">Register New App</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">App Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2"
                    value={form.app_name}
                    onChange={(e) => setForm({ ...form, app_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Whitelisted IPs</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2"
                    placeholder="Comma separated"
                    value={form.whitelisted_ips}
                    onChange={(e) => setForm({ ...form, whitelisted_ips: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-black"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
