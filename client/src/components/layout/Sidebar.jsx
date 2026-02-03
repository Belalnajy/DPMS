/**
 * Sidebar Component
 * Navigation sidebar with role-based menu items
 */
import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  LayoutDashboard,
  BookOpen,
  Settings,
  Activity,
  LogOut,
  User,
  ChevronRight,
  LogOutIcon,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getProfilePictureUrl } from '../../utils/imageUtils';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Doctor navigation links
  const doctorLinks = [
    { path: '/doctor/dashboard', label: 'Patients List', icon: Users },
    { path: '/doctor/messages', label: 'Messages', icon: MessageSquare },
  ];

  // Patient navigation links
  const patientLinks = [
    { path: '/patient/dashboard', label: 'My Overview', icon: LayoutDashboard },
    { path: '/patient/logbook', label: 'My Logbook', icon: BookOpen },
    { path: '/patient/messages', label: 'Messages', icon: MessageSquare },
    { path: '/patient/settings', label: 'Settings', icon: Settings },
  ];

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="DiaMonitor Logo"
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto space-y-1">
          <div className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          <ul className="space-y-1.5">
            {links.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`
                      relative group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                      ${
                        active
                          ? 'bg-primary-50 text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}>
                    {active && (
                      <div className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full" />
                    )}
                    <link.icon
                      className={`w-5 h-5 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                    <span className="flex-1">{link.label}</span>
                    {active && (
                      <ChevronRight className="w-4 h-4 text-primary-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-3 cursor-pointer hover:border-gray-200 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden ring-2 ring-white shadow-sm">
                {user?.profile_picture ? (
                  <img
                    src={getProfilePictureUrl(user.profile_picture)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 opacity-80 hover:opacity-100">
            <LogOutIcon className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
