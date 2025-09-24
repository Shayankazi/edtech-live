import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Header = () => {
  const { user, logout, isAuthenticated, isInstructor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navigation = [
    { name: 'Courses', href: '/courses' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'My Courses', href: '/my-courses', icon: BookOpenIcon },
    { name: 'Wishlist', href: '/wishlist', icon: HeartIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const instructorNavigation = [
    { name: 'Instructor Dashboard', href: '/instructor', icon: AcademicCapIcon },
    { name: 'Create Course', href: '/instructor/courses/create', icon: BookOpenIcon },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-secondary-900">
                VLP
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  location.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-secondary-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-secondary-600 hover:text-secondary-900 transition-colors">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-secondary-600" />
                    )}
                    <span className="hidden md:block text-sm font-medium text-secondary-900">
                      {user?.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-strong border border-secondary-200 py-2"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-secondary-100">
                          <p className="text-sm font-medium text-secondary-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-secondary-600">
                            {user?.email}
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                            {user?.role}
                          </span>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-2">
                          {userNavigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.name}
                            </Link>
                          ))}

                          {isInstructor && (
                            <>
                              <div className="border-t border-secondary-100 my-2"></div>
                              {instructorNavigation.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  onClick={() => setIsProfileOpen(false)}
                                  className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                                >
                                  <item.icon className="w-4 h-4 mr-3" />
                                  {item.name}
                                </Link>
                              ))}
                            </>
                          )}

                          <div className="border-t border-secondary-100 my-2"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-secondary-200 py-4"
            >
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                      'block px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      location.pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
