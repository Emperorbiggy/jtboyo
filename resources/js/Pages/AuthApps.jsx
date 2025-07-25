import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FaPlusCircle, FaCopy, FaEllipsisV } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AuthAppIndex() {
  const [apps, setApps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ app_name: '', whitelisted_ips: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [showTokenId, setShowTokenId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete' | 'status', id: number }

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
      if (editingId) {
        await axios.put(`/api/v1/auth-apps/${editingId}`, form);
        toast.success('App updated successfully!');
      } else {
        await axios.post('/api/v1/generate-token', form);
        toast.success('Token generated successfully!');
      }
      setForm({ app_name: '', whitelisted_ips: '', description: '' });
      setShowModal(false);
      setEditingId(null);
      fetchApps();
    } catch (error) {
      if (error.response?.status === 422) {
        Object.values(error.response.data.messages).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (app) => {
    setForm({
      app_name: app.app_name,
      whitelisted_ips: app.whitelisted_ips.join(', '),
      description: app.description || '',
    });
    setEditingId(app.id);
    setShowModal(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`/api/v1/auth-apps/${id}/status`);
      toast.success('Status updated!');
      fetchApps();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/auth-apps/${id}`);
      toast.success('App deleted.');
      fetchApps();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copied!');
  };

  return (
    <>
      <Head title="Authorized Apps" />
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Authorized Apps</h1>
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
          <button
            onClick={() => {
              setForm({ app_name: '', whitelisted_ips: '', description: '' });
              setEditingId(null);
              setShowModal(true);
            }}
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
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{app.app_name}</td>
                  <td className="py-2 px-4 text-xs">
                    {showTokenId === app.id ? (
                      <span className="break-all">{app.token}</span>
                    ) : (
                      '••••••••••••••••'
                    )}
                    <button
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        if (showTokenId === app.id) {
                          setShowTokenId(null);
                        } else {
                          setShowTokenId(app.id);
                          handleCopyToken(app.token);
                        }
                      }}
                      title="Copy token"
                    >
                      <FaCopy />
                    </button>
                  </td>
                  <td className="py-2 px-4">{app.whitelisted_ips?.join(', ')}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        app.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {app.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-4">{app.last_accessed_at || 'Never'}</td>
                  <td className="py-2 px-4 relative">
                    <button onClick={() => setDropdownOpenId(dropdownOpenId === app.id ? null : app.id)}>
                      <FaEllipsisV />
                    </button>
                    {dropdownOpenId === app.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => handleEdit(app)}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => setConfirmAction({ type: 'status', id: app.id })}
                        >
                          {app.status ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmAction({ type: 'delete', id: app.id })}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* App Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold text-green-700 mb-4">
                {editingId ? 'Edit App' : 'Register New App'}
              </h2>
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
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : editingId ? 'Update' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {confirmAction.type === 'delete' ? 'Delete App' : 'Change App Status'}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to {confirmAction.type === 'delete' ? 'delete this app' : 'toggle the status'}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const { type, id } = confirmAction;
                    setConfirmAction(null);
                    if (type === 'delete') {
                      await handleDelete(id);
                    } else {
                      await handleToggleStatus(id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
