import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-primary-200 mb-4">
              404
            </div>
            <div className="w-64 h-32 mx-auto bg-gradient-to-r from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <div className="text-6xl">🔍</div>
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-secondary-600 mb-8 max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved, deleted, or you entered the wrong URL.
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

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <p className="text-secondary-600 mb-4">
              Or try one of these popular pages:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/courses"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse Courses
              </Link>
              <Link
                to="/about"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
