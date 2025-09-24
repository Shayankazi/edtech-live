import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, BookOpenIcon, CheckIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/outline';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const RegisterPage = () => {
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    clearError();
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      // Redirect based on user role
      if (userData.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: password && password.length >= 6 },
    { text: 'Contains uppercase letter', met: password && /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: password && /[a-z]/.test(password) },
    { text: 'Contains number', met: password && /\d/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-secondary-900">
              VLP
            </span>
          </Link>
          <h2 className="text-3xl font-display font-bold text-secondary-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-secondary-600">
            Join thousands of learners and start your journey today
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-body">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name must be less than 100 characters',
                    },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedRole === 'student'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <UserIcon className={`w-8 h-8 mx-auto mb-2 ${
                        selectedRole === 'student' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className={`text-sm font-medium ${
                        selectedRole === 'student' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        Learn
                      </div>
                      <div className={`text-xs ${
                        selectedRole === 'student' ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        Take courses & learn new skills
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('instructor')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedRole === 'instructor'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <AcademicCapIcon className={`w-8 h-8 mx-auto mb-2 ${
                        selectedRole === 'instructor' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className={`text-sm font-medium ${
                        selectedRole === 'instructor' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        Teach
                      </div>
                      <div className={`text-xs ${
                        selectedRole === 'instructor' ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        Create courses & share knowledge
                      </div>
                    </div>
                  </button>
                </div>
                
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  {...register('role', { required: 'Please select a role' })}
                  value={selectedRole}
                />
                
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain uppercase, lowercase, and number',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <CheckIcon
                          className={`w-3 h-3 mr-2 ${
                            req.met ? 'text-success-600' : 'text-secondary-400'
                          }`}
                        />
                        <span
                          className={req.met ? 'text-success-600' : 'text-secondary-600'}
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mt-1"
                  {...register('terms', {
                    required: 'You must agree to the terms and conditions',
                  })}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-secondary-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-error-600">
                  {errors.terms.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn-primary w-full btn-lg"
              >
                {isSubmitting || loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="mt-6 w-full flex justify-center items-center px-4 py-3 border border-secondary-300 rounded-lg shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 transition-colors duration-200"
            >
              <FaGoogle className="w-5 h-5 text-red-500 mr-3" />
              Sign up with Google
            </button>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-secondary-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
