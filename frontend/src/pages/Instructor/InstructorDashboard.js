import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { UserService } from '../../services/api';
import {
  PlusIcon,
  BookOpenIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const InstructorDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery(
    ['instructor-dashboard'],
    UserService.getDashboard,
    { staleTime: 5 * 60 * 1000 }
  );

  const dashboard = dashboardData?.dashboard;
  const instructorStats = dashboard?.instructorStats;
  const myCourses = dashboard?.myCourses || [];

  const statCards = [
    {
      title: 'Total Courses',
      value: instructorStats?.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Students',
      value: instructorStats?.totalStudents || 0,
      icon: UsersIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${instructorStats?.totalRevenue || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Avg Rating',
      value: instructorStats?.averageRating?.toFixed(1) || '0.0',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading instructor dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-secondary-600">
              Manage your courses and track your teaching performance
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/instructor/courses/create" className="btn-primary btn-lg">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Course
            </Link>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.bgColor} mr-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    My Courses
                  </h2>
                  <Link
                    to="/instructor/courses/create"
                    className="btn-primary btn-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    New Course
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {myCourses.length > 0 ? (
                  <div className="space-y-4">
                    {myCourses.map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                      >
                        <img
                          src={course.thumbnail || '/api/placeholder/80/60'}
                          alt={course.title}
                          className="w-16 h-12 object-cover rounded-lg mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary-900 mb-1">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-secondary-600">
                            <span className="flex items-center">
                              <UsersIcon className="w-4 h-4 mr-1" />
                              {course.enrollmentCount || 0} students
                            </span>
                            <span className="flex items-center">
                              <ChartBarIcon className="w-4 h-4 mr-1" />
                              {course.rating?.average?.toFixed(1) || '0.0'} rating
                            </span>
                            <span className={`badge ${
                              course.status === 'published' 
                                ? 'badge-success' 
                                : course.status === 'draft'
                                ? 'badge-warning'
                                : 'badge-secondary'
                            }`}>
                              {course.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="btn-ghost btn-sm p-2"
                            title="View Course"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/instructor/courses/${course._id}/edit`}
                            className="btn-ghost btn-sm p-2"
                            title="Edit Course"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/instructor/courses/${course._id}/analytics`}
                            className="btn-ghost btn-sm p-2"
                            title="View Analytics"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpenIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      No courses yet
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      Create your first course to start teaching
                    </p>
                    <Link to="/instructor/courses/create" className="btn-primary">
                      Create Your First Course
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Quick Actions
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <Link
                    to="/instructor/courses/create"
                    className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
                  >
                    <PlusIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="text-primary-700 font-medium">
                      Create New Course
                    </span>
                  </Link>
                  
                  <Link
                    to="/instructor/analytics"
                    className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group"
                  >
                    <ChartBarIcon className="w-5 h-5 text-secondary-600 mr-3" />
                    <span className="text-secondary-700 font-medium">
                      View Analytics
                    </span>
                  </Link>
                  
                  <Link
                    to="/instructor/students"
                    className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group"
                  >
                    <UsersIcon className="w-5 h-5 text-secondary-600 mr-3" />
                    <span className="text-secondary-700 font-medium">
                      Manage Students
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Recent Activity
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {instructorStats?.recentActivity?.length > 0 ? (
                    instructorStats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-secondary-600">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <ChartBarIcon className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                      <p className="text-sm text-secondary-600">
                        No recent activity
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Teaching Tips
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">
                      Engage Your Students
                    </h4>
                    <p className="text-sm text-blue-700">
                      Use interactive elements and real-world examples to keep students engaged.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">
                      Quality Content
                    </h4>
                    <p className="text-sm text-green-700">
                      Focus on creating high-quality, well-structured content that provides value.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">
                      Student Feedback
                    </h4>
                    <p className="text-sm text-purple-700">
                      Regularly check and respond to student questions and feedback.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
