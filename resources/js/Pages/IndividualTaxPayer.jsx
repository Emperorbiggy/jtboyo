import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const basePath = '/app/public';
const demoTaxpayers = [
  {
    tin: '0025152785',
    bvn: '22142XXXXXX',
    nin: '52332222',
    Title: 'Mr.',
    SBIRt_name: 'ARUA',
    middle_name: 'ONWUKA',
    last_name: 'OBAJI',
    GenderName: 'Male',
    StateOfOrigin: 'ABIA',
    date_of_birth: '2025-05-23',
    nationality_name: 'Nigerian',
    phone_no_1: '08024986156',
    LGAName: 'YABO',
    StateName: 'ABIA',
    CountryName: 'Nigeria',
    TaxAuthorityCode: 'ABIRS',
    TaxAuthorityName: 'Abia State Board of Internal Revenue',
    TaxpayerStatus: 'Active',
  },
  {
    tin: '0025152786',
    bvn: '22142XXXXXY',
    nin: '52332223',
    Title: 'Mrs.',
    SBIRt_name: 'GRACE',
    middle_name: 'EMEKA',
    last_name: 'NWANKWO',
    GenderName: 'Female',
    StateOfOrigin: 'ENUGU',
    date_of_birth: '2025-04-12',
    nationality_name: 'Nigerian',
    phone_no_1: '08033921156',
    LGAName: 'NSUKKA',
    StateName: 'ENUGU',
    CountryName: 'Nigeria',
    TaxAuthorityCode: 'ENIRS',
    TaxAuthorityName: 'Enugu Internal Revenue Service',
    TaxpayerStatus: 'Active',
  },
  {
    tin: '0025152787',
    bvn: '22142XXXXXZ',
    nin: '52332224',
    Title: 'Dr.',
    SBIRt_name: 'TUNDE',
    middle_name: 'BOLA',
    last_name: 'FALANA',
    GenderName: 'Male',
    StateOfOrigin: 'LAGOS',
    date_of_birth: '2025-05-07',
    nationality_name: 'Nigerian',
    phone_no_1: '07023456156',
    LGAName: 'IKEJA',
    StateName: 'LAGOS',
    CountryName: 'Nigeria',
    TaxAuthorityCode: 'LIRS',
    TaxAuthorityName: 'Lagos Internal Revenue Service',
    TaxpayerStatus: 'Inactive',
  },
  {
    tin: '0025152788',
    bvn: '22142XXXXXK',
    nin: '52332225',
    Title: 'Mr.',
    SBIRt_name: 'KINGSLEY',
    middle_name: 'UZO',
    last_name: 'NWAFOR',
    GenderName: 'Male',
    StateOfOrigin: 'ANAMBRA',
    date_of_birth: '2025-05-15',
    nationality_name: 'Nigerian',
    phone_no_1: '08112345678',
    LGAName: 'AWKA SOUTH',
    StateName: 'ANAMBRA',
    CountryName: 'Nigeria',
    TaxAuthorityCode: 'ANIRS',
    TaxAuthorityName: 'Anambra State IRS',
    TaxpayerStatus: 'Active',
  },
];

export default function IndividualTaxPayer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  });
  const [toDate, setToDate] = useState(new Date());
  const itemsPerPage = 10;

  const filteredTaxpayers = demoTaxpayers.filter((t) => {
    const matchSearch = t.tin.toLowerCase().includes(search.toLowerCase()) || 
                        t.SBIRt_name.toLowerCase().includes(search.toLowerCase()) ||
                        t.last_name.toLowerCase().includes(search.toLowerCase());

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
          <button
  onClick={() => window.location.href = `${basePath}/dashboard`}
  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
>
  ← Back to Dashboard
</button>



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
                      {`${t.Title} ${t.SBIRt_name} ${t.middle_name} ${t.last_name}`}
                    </td>
                    <td className="px-4 py-2">{t.GenderName}</td>
                    <td className="px-4 py-2">{t.date_of_birth}</td>
                    <td className="px-4 py-2">{t.phone_no_1}</td>
                    <td className="px-4 py-2">{t.nationality_name}</td>
                    <td className="px-4 py-2">{t.StateName}</td>
                    <td className="px-4 py-2">{t.LGAName}</td>
                    <td className="px-4 py-2">{t.TaxAuthorityName}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.TaxpayerStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
