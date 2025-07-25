import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { FaPlus, FaCopy, FaEllipsisV } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateApp() {
  const [apps, setApps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    app_name: '',
    whitelisted_ips: '',
    description: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editAppId, setEditAppId] = useState(null);
  const [showToken, setShowToken] = useState({});

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get('/api/auth-apps');
      setApps(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch apps');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode && editAppId) {
        await axios.put(`/api/auth-apps/${editAppId}`, formData);
        toast.success('App updated');
      } else {
        await axios.post('/api/auth-apps/generate-token', formData);
        toast.success('App created');
      }

      setFormData({ app_name: '', whitelisted_ips: '', description: '' });
      setEditAppId(null);
      setEditMode(false);
      setShowModal(false);
      fetchApps();
    } catch (err) {
      toast.error('Submission failed');
    }
  };

  const handleEdit = (app) => {
    setFormData({
      app_name: app.app_name,
      whitelisted_ips: app.whitelisted_ips.join(','),
      description: app.description || '',
    });
    setEditMode(true);
    setEditAppId(app.id);
    setShowModal(true);
  };

  const toggleStatus = async (app) => {
    try {
      await axios.put(`/api/auth-apps/${app.id}/toggle-status`);
      toast.success('Status updated');
      fetchApps();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copied');
  };

  return (
    <DashboardLayout>
      <Head title="Auth Apps" />
      <Toaster />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Auth Apps</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setFormData({ app_name: '', whitelisted_ips: '', description: '' });
          }}
        >
          <FaPlus className="inline-block mr-2" />
          Add App
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <div key={app.id} className="border rounded-lg shadow p-4 relative">
            <div className="absolute top-2 right-2">
              <Dropdown
                onEdit={() => handleEdit(app)}
                onToggle={() => toggleStatus(app)}
                isActive={app.status}
              />
            </div>
            <h2 className="text-lg font-bold">{app.app_name}</h2>
            <p className="text-sm text-gray-600 mt-1">{app.description}</p>
            <div className="mt-2">
              <label className="text-sm text-gray-500">Token:</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                  {showToken[app.id] ? app.token : '••••••••••••••••••'}
                </span>
                <button
                  onClick={() =>
                    setShowToken(prev => ({ ...prev, [app.id]: !prev[app.id] }))
                  }
                  className="text-xs underline text-blue-600"
                >
                  {showToken[app.id] ? 'Hide' : 'Show'}
                </button>
                <FaCopy
                  className="cursor-pointer text-gray-600"
                  onClick={() => copyToken(app.token)}
                />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${app.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {app.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editMode ? 'Edit App' : 'Create App'}</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="app_name"
                value={formData.app_name}
                onChange={handleChange}
                className="w-full border rounded p-2"
                placeholder="App Name"
              />
              <input
                type="text"
                name="whitelisted_ips"
                value={formData.whitelisted_ips}
                onChange={handleChange}
                className="w-full border rounded p-2"
                placeholder="Whitelisted IPs (comma-separated)"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded p-2"
                placeholder="Description"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editMode ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const Dropdown = ({ onEdit, onToggle, isActive }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <FaEllipsisV
        onClick={() => setOpen(!open)}
        className="cursor-pointer text-gray-600"
      />
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border shadow rounded z-10">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onToggle();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  );
};
