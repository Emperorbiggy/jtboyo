// NonIndividualTaxPayers.jsx
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaSearch } from 'react-icons/fa';
const basePath = '/app/public';

const demoData = [
  {
    tin: '1200325502',
    registered_name: 'RICE FARMERS ASSOCIATION OF NIGERIA',
    main_trade_name: 'RICE FARMERS ASSOCIATION OF NIGERIA',
    org_name: 'STATE MDA',
    registration_number: 'KN/CD/NSR/001/19',
    phone_no_1: '08084437336',
    phone_no_2: null,
    email_address: 'gyabubakar@gmail.com',
    line_of_business_code: '032',
    lob_name: 'Aquaculture',
    date_of_registration: '2019-04-22',
    commencement_date: '2001-05-05',
    date_of_incorporation: '2001-05-05',
    house_number: 'NO240',
    street_name: 'TSAMIYA QUATERS KANO',
    city: 'KANO',
    LGAName: 'BUNZA',
    StateName: 'KANO',
    CountryName: 'Nigeria',
    FinYrBegin: '01-01',
    FinYrEnd: '31-12',
    director_name: null,
    director_phone: null,
    director_email: null,
    TaxAuthorityCode: 'KNIRS',
    TaxAuthorityName: 'Kano State Board of Internal Revenue',
    TaxpayerStatus: 'Deactivated',
  },
  {
    tin: '1200325503',
    registered_name: 'GLOBAL BUILDERS LIMITED',
    main_trade_name: 'Global Builders',
    org_name: 'PRIVATE FIRM',
    registration_number: 'KN/CD/NSR/002/20',
    phone_no_1: '08012345678',
    phone_no_2: '09087654321',
    email_address: 'info@globalbuilders.com',
    line_of_business_code: '045',
    lob_name: 'Construction',
    date_of_registration: '2020-02-15',
    commencement_date: '2015-03-10',
    date_of_incorporation: '2015-03-10',
    house_number: '15B',
    street_name: 'Yar’adua Crescent',
    city: 'Kano',
    LGAName: 'NASSARAWA',
    StateName: 'KANO',
    CountryName: 'Nigeria',
    FinYrBegin: '01-01',
    FinYrEnd: '31-12',
    director_name: 'Abdullahi Musa',
    director_phone: '08098765432',
    director_email: 'abdullahi@globalbuilders.com',
    TaxAuthorityCode: 'KNIRS',
    TaxAuthorityName: 'Kano State BIR',
    TaxpayerStatus: 'Active',
  },
  {
    tin: '1200325504',
    registered_name: 'BLUE WATERS ENTERPRISE',
    main_trade_name: 'Blue Waters',
    org_name: 'ENTERPRISE',
    registration_number: 'KN/CD/NSR/003/21',
    phone_no_1: '08123456789',
    phone_no_2: null,
    email_address: 'contact@bluewaters.com',
    line_of_business_code: '014',
    lob_name: 'Bottled Water Production',
    date_of_registration: '2021-07-01',
    commencement_date: '2020-01-01',
    date_of_incorporation: '2020-01-01',
    house_number: '7A',
    street_name: 'Ocean Drive',
    city: 'Kano',
    LGAName: 'UNGOGO',
    StateName: 'KANO',
    CountryName: 'Nigeria',
    FinYrBegin: '01-01',
    FinYrEnd: '31-12',
    director_name: 'Fatima Idris',
    director_phone: '08011223344',
    director_email: 'fatima@bluewaters.com',
    TaxAuthorityCode: 'KNIRS',
    TaxAuthorityName: 'Kano State BIR',
    TaxpayerStatus: 'Active',
  },
  {
    tin: '1200325505',
    registered_name: 'SKYLINE HOTELS LTD',
    main_trade_name: 'Skyline',
    org_name: 'LIMITED',
    registration_number: 'KN/CD/NSR/004/22',
    phone_no_1: '08099887766',
    phone_no_2: null,
    email_address: 'info@skylinehotels.com',
    line_of_business_code: '099',
    lob_name: 'Hospitality',
    date_of_registration: '2022-03-10',
    commencement_date: '2021-11-15',
    date_of_incorporation: '2021-11-15',
    house_number: 'Plot 12',
    street_name: 'Airport Road',
    city: 'Kano',
    LGAName: 'TARAUNI',
    StateName: 'KANO',
    CountryName: 'Nigeria',
    FinYrBegin: '01-01',
    FinYrEnd: '31-12',
    director_name: 'Usman Bello',
    director_phone: '08122334455',
    director_email: 'usman@skylinehotels.com',
    TaxAuthorityCode: 'KNIRS',
    TaxAuthorityName: 'Kano State BIR',
    TaxpayerStatus: 'Pending',
  },
];

export default function NonIndividualTaxPayers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState(new Date('2018-01-01'));
  const [toDate, setToDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = demoData.filter((item) => {
    const searchMatch =
      item.tin.toLowerCase().includes(search.toLowerCase()) ||
      item.registered_name.toLowerCase().includes(search.toLowerCase());
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
              {paginated.map((item, index) => (
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
              ))}
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
