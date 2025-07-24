import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function IndividualTaxPayer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [taxpayers, setTaxpayers] = useState([]);

  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const [toDate, setToDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });

  const itemsPerPage = 100;

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch('/api/jtb/individuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          fromDate,
          toDate,
        }),
      });

      const response = await res.json();
      console.log('Fetched data:', response);

      // ✅ Check nested structure correctly
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        setTaxpayers(response.data.data);
      } else {
        console.warn('Unexpected data shape:', response);
        setTaxpayers([]);
      }
    } catch (error) {
      console.error('Error fetching taxpayers:', error);
      setTaxpayers([]);
    }
  };

  if (fromDate && toDate) {
    fetchData();
  }
}, [fromDate, toDate]);


  const filteredTaxpayers = taxpayers.filter((t) => {
    const searchTerm = search.trim().toLowerCase();

    const matchSearch =
      t.tin?.toLowerCase().includes(searchTerm) ||
      t.first_name?.toLowerCase().includes(searchTerm) ||
      t.last_name?.toLowerCase().includes(searchTerm);

    const matchStatus =
      statusFilter === '' || t.TaxpayerStatus?.toLowerCase() === statusFilter.toLowerCase();

    const regDate = t.date_of_registration ? new Date(t.date_of_registration) : null;

    const matchDate =
      !regDate ||
      (regDate.setHours(0, 0, 0, 0), regDate >= fromDate && regDate <= toDate);

    return matchSearch && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filteredTaxpayers.length / itemsPerPage);
  const paginatedData = filteredTaxpayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTaxpayers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Taxpayers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'individual_taxpayers.xlsx');
  };

  return (
    <DashboardLayout>
      <Head title="Individual Taxpayers" />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <Link
            href={`/dashboard`}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center border px-2 py-1 rounded">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by TIN or Name"
                className="px-2 py-1 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                date.setHours(0, 0, 0, 0);
                setFromDate(date);
              }}
              dateFormat="yyyy-MM-dd"
              className="border px-3 py-2 rounded text-sm"
            />

            <DatePicker
              selected={toDate}
              onChange={(date) => {
                date.setHours(23, 59, 59, 999);
                setToDate(date);
              }}
              dateFormat="yyyy-MM-dd"
              className="border px-3 py-2 rounded text-sm"
            />

            <button
              onClick={exportToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export to Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow border text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-2 py-1">TIN</th>
                <th className="px-2 py-1">Full Name</th>
                <th className="px-2 py-1">Gender</th>
                <th className="px-2 py-1">DOB</th>
                <th className="px-2 py-1">Phone 1</th>
                <th className="px-2 py-1">Phone 2</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">Nationality</th>
                <th className="px-2 py-1">Marital Status</th>
                <th className="px-2 py-1">Occupation</th>
                <th className="px-2 py-1">LGA</th>
                <th className="px-2 py-1">State</th>
                <th className="px-2 py-1">State of Origin</th>
                <th className="px-2 py-1">City</th>
                <th className="px-2 py-1">Street</th>
                <th className="px-2 py-1">House No</th>
                <th className="px-2 py-1">Tax Authority</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="19" className="text-center py-4 text-gray-500">
                    No taxpayers found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-100 border-b text-xs">
                    <td className="px-2 py-1">{t.tin}</td>
                    <td className="px-2 py-1">
                      {[t.Title, t.first_name, t.middle_name, t.last_name].filter(Boolean).join(' ')}
                    </td>
                    <td className="px-2 py-1">{t.GenderName}</td>
                    <td className="px-2 py-1">{t.date_of_birth?.slice(0, 10)}</td>
                    <td className="px-2 py-1">{t.phone_no_1}</td>
                    <td className="px-2 py-1">{t.phone_no_2 || '—'}</td>
                    <td className="px-2 py-1">{t.email_address}</td>
                    <td className="px-2 py-1">{t.nationality_name}</td>
                    <td className="px-2 py-1">{t.MaritalStatus}</td>
                    <td className="px-2 py-1">{t.Occupation}</td>
                    <td className="px-2 py-1">{t.LGAName}</td>
                    <td className="px-2 py-1">{t.StateName}</td>
                    <td className="px-2 py-1">{t.StateOfOrigin}</td>
                    <td className="px-2 py-1">{t.city}</td>
                    <td className="px-2 py-1">{t.street_name}</td>
                    <td className="px-2 py-1">{t.house_number}</td>
                    <td className="px-2 py-1">{t.TaxAuthorityName}</td>
                    <td className="px-2 py-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          t.TaxpayerStatus === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.TaxpayerStatus}
                      </span>
                    </td>
                    <td className="px-2 py-1">{t.date_of_registration?.slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
