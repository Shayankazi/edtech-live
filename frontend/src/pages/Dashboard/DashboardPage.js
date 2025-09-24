import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { UserService } from '../../services/api';
import {
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  PlayIcon,
  StarIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard'],
    UserService.getDashboard,
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const dashboard = dashboardData?.dashboard;
  const metrics = dashboard?.metrics;
  const recentActivity = dashboard?.recentActivity || [];
  const achievements = dashboard?.achievements || [];

  const statCards = [
    {
      title: 'Enrolled Courses',
      value: metrics?.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: metrics?.completedCourses || 0,
      icon: TrophyIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Watch Time',
      value: `${metrics?.totalWatchTime || 0}m`,
      icon: ClockIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Current Streak',
      value: `${metrics?.currentStreak || 0} days`,
      icon: FireIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-secondary-600">
              Continue your learning journey and track your progress
            </p>
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
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    Continue Learning
                  </h2>
                  <Link
                    to="/my-courses"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    View all
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 3).map((activity, index) => (
                      <div
                        key={activity.course._id}
                        className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                      >
                        <img
                          src={activity.course.thumbnail || '/api/placeholder/80/60'}
                          alt={activity.course.title}
                          className="w-16 h-12 object-cover rounded-lg mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary-900 mb-1">
                            {activity.course.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="progress w-32">
                              <div
                                className="progress-bar"
                                style={{ width: `${activity.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-secondary-600 ml-3">
                              {activity.progress}% complete
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/learn/${activity.course._id}`}
                          className="btn-primary btn-sm ml-4"
                        >
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Continue
                        </Link>
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
                      Start your learning journey by enrolling in a course
                    </p>
                    <Link to="/courses" className="btn-primary">
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Recent Achievements
                </h2>
              </div>
              <div className="card-body">
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-yellow-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                          <TrophyIcon className="w-5 h-5 text-yellow-900" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900 text-sm">
                            {achievement.type === 'first_course' && 'First Course Completed!'}
                            {achievement.type === 'course_completed' && 'Course Completed!'}
                            {achievement.type === 'streak_7' && '7-Day Streak!'}
                            {achievement.type === 'streak_30' && '30-Day Streak!'}
                          </p>
                          <p className="text-xs text-secondary-600">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrophyIcon className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-600">
                      Complete courses to earn achievements
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

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
                    to="/courses"
                    className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
                  >
                    <BookOpenIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="text-primary-700 font-medium">
                      Browse Courses
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-primary-600 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/wishlist"
                    className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group"
                  >
                    <StarIcon className="w-5 h-5 text-secondary-600 mr-3" />
                    <span className="text-secondary-700 font-medium">
                      My Wishlist
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-secondary-600 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group"
                  >
                    <CalendarIcon className="w-5 h-5 text-secondary-600 mr-3" />
                    <span className="text-secondary-700 font-medium">
                      Learning Stats
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-secondary-600 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Study Goal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Daily Goal
                </h2>
              </div>
              <div className="card-body">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.65)}`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">65%</span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 mb-2">
                    20 of 30 minutes today
                  </p>
                  <p className="text-xs text-secondary-500">
                    Keep going! You're doing great 🎉
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
