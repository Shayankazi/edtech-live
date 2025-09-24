import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { UserService } from '../../services/api';
import {
  PlayIcon,
  ClockIcon,
  BookOpenIcon,
  TrophyIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MyCoursesPage = () => {
  const [filter, setFilter] = useState('all'); // all, in-progress, completed
  const [sortBy, setSortBy] = useState('recent'); // recent, progress, alphabetical

  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard'],
    UserService.getDashboard,
    { staleTime: 5 * 60 * 1000 }
  );

  const enrolledCourses = dashboardData?.dashboard?.enrolledCourses || [];

  // Filter courses based on selected filter
  const filteredCourses = enrolledCourses.filter(course => {
    if (filter === 'completed') return course.progress >= 100;
    if (filter === 'in-progress') return course.progress > 0 && course.progress < 100;
    return true; // 'all'
  });

  // Sort courses based on selected sort option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progress - a.progress;
      case 'alphabetical':
        return a.course.title.localeCompare(b.course.title);
      case 'recent':
      default:
        return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    }
  });

  const filterOptions = [
    { value: 'all', label: 'All Courses', count: enrolledCourses.length },
    { 
      value: 'in-progress', 
      label: 'In Progress', 
      count: enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length 
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      count: enrolledCourses.filter(c => c.progress >= 100).length 
    },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Accessed' },
    { value: 'progress', label: 'Progress' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your courses..." />
      </div>
    );
  }

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
            <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
              My Courses
            </h1>
            <p className="text-secondary-600">
              Continue your learning journey with {enrolledCourses.length} enrolled courses
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
          >
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-secondary-900 mb-1">
                {enrolledCourses.length}
              </div>
              <div className="text-sm text-secondary-600">
                Total Enrolled
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <PlayIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-secondary-900 mb-1">
                {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
              </div>
              <div className="text-sm text-secondary-600">
                In Progress
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrophyIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-secondary-900 mb-1">
                {enrolledCourses.filter(c => c.progress >= 100).length}
              </div>
              <div className="text-sm text-secondary-600">
                Completed
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-secondary-200 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input input-sm w-auto"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Grid */}
        {sortedCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <AdjustmentsHorizontalIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {filter === 'all' ? 'No courses enrolled yet' : `No ${filter.replace('-', ' ')} courses`}
            </h3>
            <p className="text-secondary-600 mb-6">
              {filter === 'all' 
                ? 'Start your learning journey by enrolling in a course'
                : `You don't have any ${filter.replace('-', ' ')} courses yet`
              }
            </p>
            {filter === 'all' && (
              <Link to="/courses" className="btn-primary">
                Browse Courses
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((enrollment, index) => (
              <motion.div
                key={enrollment.course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover group"
              >
                <div className="relative">
                  <img
                    src={enrollment.course.thumbnail || '/api/placeholder/400/240'}
                    alt={enrollment.course.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  
                  {/* Progress Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span>{Math.round(enrollment.progress)}% complete</span>
                      <span>{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-primary-500" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="absolute top-4 right-4">
                    <Link
                      to={`/learn/${enrollment.course._id}`}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group-hover:scale-110 transform duration-200"
                    >
                      <PlayIcon className="w-5 h-5 text-primary-600 ml-0.5" />
                    </Link>
                  </div>

                  {/* Completion Badge */}
                  {enrollment.progress >= 100 && (
                    <div className="absolute top-4 left-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <TrophyIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-primary text-xs">
                      {enrollment.course.category}
                    </span>
                    <span className="badge-secondary text-xs">
                      {enrollment.course.level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>

                  <p className="text-sm text-secondary-600 mb-3">
                    {enrollment.course.instructor?.name}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">
                        {enrollment.course.rating?.average?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {enrollment.course.totalDuration || 0}m
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-500">
                      Last accessed: {new Date(enrollment.lastAccessed).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/learn/${enrollment.course._id}`}
                      className="btn-primary btn-sm"
                    >
                      {enrollment.progress >= 100 ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
