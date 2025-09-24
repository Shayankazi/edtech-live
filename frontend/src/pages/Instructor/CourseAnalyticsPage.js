import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const CourseAnalyticsPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <ChartBarIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
            Course Analytics
          </h1>
          <p className="text-secondary-600 mb-8">
            Detailed analytics and insights for your course performance.
          </p>
          <div className="card max-w-md mx-auto">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-900 mb-2">Course ID: {id}</h3>
              <p className="text-sm text-secondary-600">
                Student engagement, completion rates, revenue tracking, and AI-powered insights.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseAnalyticsPage;
