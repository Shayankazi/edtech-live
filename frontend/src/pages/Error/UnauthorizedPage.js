import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 403 Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-error-100 rounded-full flex items-center justify-center mb-6">
              <ShieldExclamationIcon className="w-16 h-16 text-error-600" />
            </div>
            <div className="text-6xl md:text-7xl font-bold text-error-200 mb-4">
              403
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
              Access Denied
            </h1>
            <p className="text-lg text-secondary-600 mb-8 max-w-md mx-auto">
              You don't have permission to access this page. 
              Please contact your administrator or try logging in with a different account.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="btn-outline btn-lg flex items-center justify-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Go Back
              </button>
              <Link
                to="/"
                className="btn-primary btn-lg flex items-center justify-center"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">
                Need access to this feature?
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Some features require special permissions or account upgrades.
              </p>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Contact Support →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
