import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const handleDashboard = () => {
    setDropdownOpen(false);
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'worker') navigate('/worker/dashboard');
    else navigate('/citizen/dashboard');
  };

  const isActive = (path) => location.pathname === path;

  const roleConfig = {
    admin: { color: 'bg-red-500', label: 'Admin Panel', path: '/admin/dashboard' },
    worker: { color: 'bg-green-500', label: 'My Assignments', path: '/worker/dashboard' },
    citizen: { color: 'bg-blue-500', label: 'My Reports', path: '/citizen/dashboard' }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Left — Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow">
            R
          </div>
          <span className="text-gray-800 font-bold text-lg tracking-tight">
            Report<span className="text-blue-600">It</span>
          </span>
        </div>

        {/* Middle — Role Based Nav Links */}
        <div className="flex items-center gap-1">

          {/* Home — everyone */}
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Home
          </button>

          {/* Issues — everyone */}
          <button
            onClick={() => navigate('/issues')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/issues')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Issues
          </button>

          {/* Role specific link */}
          {user && (
            <button
              onClick={handleDashboard}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname.includes('dashboard')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {roleConfig[user.role]?.label}
            </button>
          )}

        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Report Button — citizen only */}
              {user.role === 'citizen' && (
                <button
                  onClick={() => navigate('/report')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                >
                  <span className="text-lg leading-none">+</span>
                  <span>Report</span>
                </button>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 hover:border-gray-300 transition"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${roleConfig[user.role]?.color}`}></span>
                            <span className="text-xs text-gray-500 capitalize">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleDashboard}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                      >
                        <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-base">
                          📊
                        </span>
                        <div>
                          <p className="font-medium">Dashboard</p>
                          <p className="text-xs text-gray-400">
                            {roleConfig[user.role]?.label}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/profile');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                      >
                        <span className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-base">
                          👤
                        </span>
                        <div>
                          <p className="font-medium">My Profile</p>
                          <p className="text-xs text-gray-400">
                            View and edit profile
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                      >
                        <span className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-base">
                          🚪
                        </span>
                        <div>
                          <p className="font-medium">Logout</p>
                          <p className="text-xs text-red-400">
                            Sign out of your account
                          </p>
                        </div>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 text-sm font-medium hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;