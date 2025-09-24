import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

const AnalyticsPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnalyticsDashboard userId={user?.id} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
