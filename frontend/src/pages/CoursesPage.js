import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CourseService } from '../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    price: searchParams.get('price') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'popular',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: coursesData, isLoading, error } = useQuery(
    ['courses', filters],
    () => CourseService.getCourses({
      ...filters,
      page: 1,
      limit: 12,
    }),
    { 
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000 
    }
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      price: '',
      rating: '',
      sortBy: 'popular',
    });
    setSearchParams({});
  };

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'AI & ML',
    'Photography',
    'Music',
    'Language',
    'Health & Fitness',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const priceOptions = [
    { label: 'All', value: '' },
    { label: 'Free', value: 'free' },
    { label: 'Paid', value: 'paid' },
  ];
  const sortOptions = [
    { label: 'Most Popular', value: 'popular' },
    { label: 'Newest', value: 'newest' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900 mb-4">
            Discover Courses
          </h1>
          <p className="text-secondary-600">
            {coursesData?.total || 0} courses available to help you learn new skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-64">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input w-full"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card mb-4"
            >
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category.toLowerCase().replace(' ', '_')}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Level
                    </label>
                    <select
                      value={filters.level}
                      onChange={(e) => handleFilterChange('level', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">All Levels</option>
                      {levels.map((level) => (
                        <option key={level} value={level.toLowerCase()}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Price
                    </label>
                    <select
                      value={filters.price}
                      onChange={(e) => handleFilterChange('price', e.target.value)}
                      className="input w-full"
                    >
                      {priceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Rating
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="input w-full"
                    >
                      <option value="">All Ratings</option>
                      <option value="4.5">4.5 & up</option>
                      <option value="4.0">4.0 & up</option>
                      <option value="3.5">3.5 & up</option>
                      <option value="3.0">3.0 & up</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="btn-ghost text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading courses..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-error-600 mb-4">
              Failed to load courses. Please try again.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : coursesData?.courses?.length === 0 ? (
          <div className="text-center py-12">
            <AdjustmentsHorizontalIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No courses found
            </h3>
            <p className="text-secondary-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesData.courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/courses/${course._id}`} className="course-card block">
                  <img
                    src={course.thumbnail || '/api/placeholder/400/240'}
                    alt={course.title}
                    className="course-card-image"
                  />
                  <div className="course-card-content">
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-primary text-xs">
                        {course.category}
                      </span>
                      <span className="badge-secondary text-xs">
                        {course.level}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-sm text-secondary-600 mb-3">
                      {course.instructor?.name}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">
                          {course.rating?.average?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-sm text-secondary-500 ml-1">
                          ({course.rating?.count || 0})
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-secondary-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {course.totalDuration || 0}m
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <div className="flex items-center text-sm text-secondary-500">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {course.enrollmentCount || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {coursesData?.courses?.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <button className="btn-outline btn-sm">Previous</button>
              <span className="px-4 py-2 text-sm text-secondary-600">
                Page 1 of {Math.ceil((coursesData?.total || 0) / 12)}
              </span>
              <button className="btn-outline btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
