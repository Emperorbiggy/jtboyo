import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FaPlusCircle } from 'react-icons/fa';

export default function AuthAppIndex() {
  const { authApps = [] } = usePage().props;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ app_name: '', whitelisted_ips: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post('/api/auth-apps/create', form, {
      onSuccess: () => {
        setForm({ app_name: '', whitelisted_ips: '', description: '' });
        setShowModal(false);
      }
    });
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
              {authApps.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{app.app_name}</td>
                  <td className="py-2 px-4 text-xs break-all">{app.token}</td>
                  <td className="py-2 px-4">{app.whitelisted_ips}</td>
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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                  >
                    Submit
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
