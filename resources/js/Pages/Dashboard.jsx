import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { FaUsers, FaBuilding, FaPlusCircle, FaFileInvoice } from 'react-icons/fa';
import DashboardLayout from '@/Layouts/DashboardLayout';

const basePath = '/app/public'; // Adjust based on your actual deployment

export default function Dashboard() {
  const { props } = usePage();
  const demoUser = props.auth?.user || { name: 'John Doe' };

  return (
    <>
      <Head title="Dashboard" />
      <DashboardLayout>
        <h1 className="text-xl font-semibold text-green-800 mb-6">
          Welcome, {demoUser.name}
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Individual Taxpayers"
            icon={<FaUsers className="text-4xl text-green-600" />}
            route={`${basePath}/individual`}
          />
          <Card
            title="Non-Individual Taxpayers"
            icon={<FaBuilding className="text-4xl text-green-600" />}
            route={`${basePath}/non-individual`}
          />
          <Card
            title="Add Tax Record"
            icon={<FaFileInvoice className="text-4xl text-green-600" />}
            route={`${basePath}/add-tax-record`}
          />
          <Card
            title="Add Asset Details"
            icon={<FaPlusCircle className="text-4xl text-green-600" />}
            route={`${basePath}/add-asset`}
          />
        </div>
      </DashboardLayout>
    </>
  );
}

function Card({ title, icon, route }) {
  return (
    <div
      onClick={() => router.visit(route)}
      className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-lg font-medium text-green-800 text-center">{title}</h2>
    </div>
  );
}
