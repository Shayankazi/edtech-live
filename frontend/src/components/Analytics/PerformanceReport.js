import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { API_CONFIG } from '../../config/api';

const PerformanceReport = ({ courseId, timeframe = '7d' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const { data: reportData, isLoading, error } = useQuery(
    ['performance-report', courseId, selectedTimeframe],
    async () => {
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        ...(courseId && { course: courseId })
      });
      
      const response = await fetch(
        `${API_CONFIG.API_URL}/analytics/reports/performance?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch performance report');
      return response.json();
    }
  );

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load report</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  const report = reportData?.report;
  const summary = report?.summary;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <ArrowTrendingUpIcon className="w-5 h-5 text-yellow-600" />;
    return <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Performance Report</h2>
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-gray-500 mt-1">
          Generated on {new Date(reportData?.generatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-900">{summary?.totalSessions || 0}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Avg Engagement</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-green-900">{summary?.averageEngagement || 0}%</p>
                  {getScoreIcon(summary?.averageEngagement || 0)}
                </div>
              </div>
              <FireIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Avg Completion</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-purple-900">{summary?.averageCompletion || 0}%</p>
                  {getScoreIcon(summary?.averageCompletion || 0)}
                </div>
              </div>
              <TrophyIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Watch Time</p>
                <p className="text-2xl font-bold text-orange-900">{summary?.totalWatchTime || 0}m</p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <TrophyIcon className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {report?.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-green-700">{strength}</span>
                </li>
              )) || (
                <li className="text-green-700">Keep up the great work!</li>
              )}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <ArrowTrendingUpIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-800">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {report?.improvements?.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-yellow-700">{improvement}</span>
                </li>
              )) || (
                <li className="text-yellow-700">You're doing great! Keep learning.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <LightBulbIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {report?.recommendations?.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-blue-700">{recommendation}</span>
              </li>
            )) || (
              <li className="text-blue-700">Continue your learning journey!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
