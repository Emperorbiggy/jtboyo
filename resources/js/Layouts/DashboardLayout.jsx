import React, { useEffect, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { FaUserCircle } from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const { auth, jtb_token, jtb_token_expires_at } = usePage().props;
  const user = auth?.user;

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // 🔐 Redirect if session/token is expired
  useEffect(() => {
    if (!user) {
      router.visit(route('login'));
    }

    // 🧪 Console log token info
    console.log('🔐 JTB Token:', jtb_token);
    console.log('📆 Token Expires At:', jtb_token_expires_at);
  }, [user, jtb_token, jtb_token_expires_at]);

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
              <Link
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
              >
                Profile
              </Link>
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
