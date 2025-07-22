import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaSearch } from 'react-icons/fa';

// const basePath = '/app/public';

export default function NonIndividualTaxPayers() {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState(sevenDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      // Validate date range (max 7 days)
      const diffInMs = toDate - fromDate;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays > 7) {
        alert('The date range cannot exceed 7 days.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/jtb/non-individuals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: toDate.toISOString().split('T')[0],
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch');

        const result = await res.json();
        setData(result?.TaxpayerList || []);
      } catch (error) {
        console.error('Error fetching non-individual taxpayers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fromDate && toDate) fetchData();
  }, [fromDate, toDate]);

  const filtered = data.filter((item) => {
    const searchMatch =
      item.tin?.toLowerCase().includes(search.toLowerCase()) ||
      item.registered_name?.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === '' || item.TaxpayerStatus === statusFilter;

    const regDate = new Date(item.date_of_registration);
    const dateMatch = regDate >= fromDate && regDate <= toDate;

    return searchMatch && statusMatch && dateMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Taxpayers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'non_individual_taxpayers.xlsx');
  };

  return (
    <DashboardLayout>
      <Head title="Non-Individual Taxpayers" />
      <div className="p-4">
        {/* Top Controls */}
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
                placeholder="Search TIN or Name"
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
              <option value="Deactivated">Deactivated</option>
              <option value="Pending">Pending</option>
            </select>

            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="dd-MM-yyyy"
              className="border px-3 py-2 rounded text-sm"
              placeholderText="From Date"
            />
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow border text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                {[
                  'TIN', 'Registered Name', 'Main Trade Name', 'Org Name', 'Reg No.',
                  'Phone 1', 'Phone 2', 'Email', 'LOB Code', 'LOB Name',
                  'Reg Date', 'Commencement', 'Incorporation', 'House No.', 'Street',
                  'City', 'LGA', 'State', 'Country', 'FY Start', 'FY End',
                  'Director Name', 'Director Phone', 'Director Email',
                  'Tax Auth Code', 'Tax Auth Name', 'Status'
                ].map((title, i) => (
                  <th key={i} className="border px-2 py-1 text-left whitespace-nowrap">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="27" className="text-center py-4">Loading...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="27" className="text-center py-4">No data found.</td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{item.tin}</td>
                    <td className="border px-2 py-1">{item.registered_name}</td>
                    <td className="border px-2 py-1">{item.main_trade_name}</td>
                    <td className="border px-2 py-1">{item.org_name}</td>
                    <td className="border px-2 py-1">{item.registration_number}</td>
                    <td className="border px-2 py-1">{item.phone_no_1}</td>
                    <td className="border px-2 py-1">{item.phone_no_2 || '-'}</td>
                    <td className="border px-2 py-1">{item.email_address}</td>
                    <td className="border px-2 py-1">{item.line_of_business_code}</td>
                    <td className="border px-2 py-1">{item.lob_name}</td>
                    <td className="border px-2 py-1">{item.date_of_registration}</td>
                    <td className="border px-2 py-1">{item.commencement_date}</td>
                    <td className="border px-2 py-1">{item.date_of_incorporation}</td>
                    <td className="border px-2 py-1">{item.house_number}</td>
                    <td className="border px-2 py-1">{item.street_name}</td>
                    <td className="border px-2 py-1">{item.city}</td>
                    <td className="border px-2 py-1">{item.LGAName}</td>
                    <td className="border px-2 py-1">{item.StateName}</td>
                    <td className="border px-2 py-1">{item.CountryName}</td>
                    <td className="border px-2 py-1">{item.FinYrBegin}</td>
                    <td className="border px-2 py-1">{item.FinYrEnd}</td>
                    <td className="border px-2 py-1">{item.director_name || '-'}</td>
                    <td className="border px-2 py-1">{item.director_phone || '-'}</td>
                    <td className="border px-2 py-1">{item.director_email || '-'}</td>
                    <td className="border px-2 py-1">{item.TaxAuthorityCode}</td>
                    <td className="border px-2 py-1">{item.TaxAuthorityName}</td>
                    <td className="border px-2 py-1">{item.TaxpayerStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
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
