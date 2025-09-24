import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <ShieldCheckIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-secondary-600 mb-8">
            Platform administration and management tools.
          </p>
          <div className="card max-w-md mx-auto">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-900 mb-2">Coming Soon</h3>
              <p className="text-sm text-secondary-600">
                User management, course moderation, analytics, and system administration.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
