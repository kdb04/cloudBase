import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from './ThemeContext';
import {
  FaSun,
  FaMoon,
  FaPlaneDeparture,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { CURRENCIES } from '../../utils/constants';
import { hasAuthToken, removeAuthToken, getAuthToken } from '../../utils/auth';
import { getApiUrl, ENDPOINTS } from '../../utils/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('EN');
  const isLoggedIn = hasAuthToken();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(getApiUrl(ENDPOINTS.LOGOUT), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    removeAuthToken();
    navigate('/Login');
    window.location.reload();
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/Booking', label: 'Book Flights' },
    { path: '/About', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-primary-hover transition-colors">
              <FaPlaneDeparture className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CloudBase
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="EN">EN</option>
              <option value="ES">ES</option>
              <option value="FR">FR</option>
            </select>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FaMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <FaSun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            ) : (
              <Link
                to="/Login"
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <FaUser className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-dark-border space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/Login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md"
                  >
                    <FaUser className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign In</span>
                  </Link>
                )}

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-sm font-medium">Theme</span>
                  {theme === 'light' ? <FaMoon className="w-4 h-4" /> : <FaSun className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
