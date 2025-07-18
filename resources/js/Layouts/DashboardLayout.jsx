import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { FaUserCircle } from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // 🔐 Redirect if session/token is expired (i.e., no user in props)
  useEffect(() => {
    if (!user) {
      router.visit(route('login'));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-green-700">Oyo Joint Tax Board</div>
        <div className="relative">
          <button
            className="flex items-center space-x-2"
            onClick={toggleDropdown}
          >
            <FaUserCircle className="text-2xl text-green-700" />
            <span className="text-sm text-gray-700">{user?.name || 'Guest'}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
              >
                Profile
              </a>
              <a
                href={route('logout')}
                method="post"
                as="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
