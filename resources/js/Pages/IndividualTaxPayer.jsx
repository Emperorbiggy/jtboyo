import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const basePath = '/app/public';

export default function IndividualTaxPayer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [taxpayers, setTaxpayers] = useState([]);

  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });

  const [toDate, setToDate] = useState(new Date());

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`api/jtb/individuals`, {
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


        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        if (data.success && data.taxpayers) {
          setTaxpayers(data.taxpayers);
        }
      } catch (error) {
        console.error('Failed to fetch taxpayers', error);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  const filteredTaxpayers = taxpayers.filter((t) => {
    const matchSearch = t.tin?.toLowerCase().includes(search.toLowerCase()) ||
                        t.SBIRt_name?.toLowerCase().includes(search.toLowerCase()) ||
                        t.last_name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === '' || t.TaxpayerStatus === statusFilter;

    const dob = new Date(t.date_of_birth);
    const matchDate = dob >= fromDate && dob <= toDate;

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
            href={`${basePath}/dashboard`}
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
              onChange={setFromDate}
              dateFormat="dd-MM-yyyy"
              className="border px-3 py-2 rounded text-sm"
              placeholderText="From Date"
            />

            <DatePicker
              selected={toDate}
              onChange={setToDate}
              dateFormat="dd-MM-yyyy"
              className="border px-3 py-2 rounded text-sm"
              placeholderText="To Date"
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
                <th className="px-4 py-2 text-left">TIN</th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Gender</th>
                <th className="px-4 py-2 text-left">DOB</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Nationality</th>
                <th className="px-4 py-2 text-left">State</th>
                <th className="px-4 py-2 text-left">LGA</th>
                <th className="px-4 py-2 text-left">Tax Authority</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No taxpayers found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-100 border-b">
                    <td className="px-4 py-2">{t.tin}</td>
                    <td className="px-4 py-2">
                      {`${t.Title || ''} ${t.SBIRt_name || ''} ${t.middle_name || ''} ${t.last_name || ''}`}
                    </td>
                    <td className="px-4 py-2">{t.GenderName}</td>
                    <td className="px-4 py-2">{t.date_of_birth}</td>
                    <td className="px-4 py-2">{t.phone_no_1}</td>
                    <td className="px-4 py-2">{t.nationality_name}</td>
                    <td className="px-4 py-2">{t.StateName}</td>
                    <td className="px-4 py-2">{t.LGAName}</td>
                    <td className="px-4 py-2">{t.TaxAuthorityName}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        t.TaxpayerStatus === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t.TaxpayerStatus}
                      </span>
                    </td>
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
