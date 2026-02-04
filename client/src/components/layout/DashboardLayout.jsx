/**
 * DashboardLayout Component
 * Main layout wrapper for dashboard pages
 * Includes sidebar and main content area
 */
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const DashboardLayout = ({
  children,
  unreadCount = 0,
  maxWidth = 'max-w-7xl',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 w-full min-w-0 transition-all duration-300 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="DiaMonitor Logo" className="h-9 w-auto" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={`p-2 sm:p-4 lg:p-8 ${maxWidth} mx-auto w-full flex-1`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
