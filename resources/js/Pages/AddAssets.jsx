import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

const basePath = '/app/public';

export default function AddAssets() {
  const [form, setForm] = useState({
    tin: '',
    location: '',
    asset_type: '',
    asset_value: '',
    date_acquired: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  const newErrors = {};
  Object.entries(form).forEach(([key, value]) => {
    if (!value) newErrors[key] = 'This field is required';
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const response = await fetch('/api/jtb/submit-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('Asset added successfully!');
      setForm({
        tin: '',
        location: '',
        asset_type: '',
        asset_value: '',
        date_acquired: '',
        description: '',
      });
    } else {
      alert(result.message || 'Something went wrong.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
};


  return (
    <>
      <Head title="Add Asset Record" />
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-800">Add Asset Record</h1>
          <button
            onClick={() => window.location.href = `${basePath}/dashboard`}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
          >
            Back to Dashboard
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow"
        >
          <Input
            label="TIN"
            name="tin"
            value={form.tin}
            onChange={handleChange}
            error={errors.tin}
          />
          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            error={errors.location}
          />
          <Input
            label="Asset Type"
            name="asset_type"
            value={form.asset_type}
            onChange={handleChange}
            error={errors.asset_type}
          />
          <Input
            label="Asset Value"
            name="asset_value"
            value={form.asset_value}
            onChange={handleChange}
            error={errors.asset_value}
          />
          <DateInput
            label="Date Acquired"
            name="date_acquired"
            value={form.date_acquired}
            onChange={handleChange}
            error={errors.date_acquired}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded transition"
            >
              Submit Asset Record
            </button>
          </div>
        </form>
      </DashboardLayout>
    </>
  );
}

// Reusable Input Component
function Input({ label, name, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 p-2 rounded"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Date Input Component using HTML date input
function DateInput({ label, name, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 p-2 rounded"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
