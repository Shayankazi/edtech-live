import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { UserService, CourseService } from '../../services/api';
import {
  HeartIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  TrashIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard'],
    UserService.getDashboard,
    { staleTime: 5 * 60 * 1000 }
  );

  const removeFromWishlistMutation = useMutation(
    (courseId) => UserService.removeFromWishlist(courseId),
    {
      onSuccess: () => {
        toast.success('Removed from wishlist!');
        queryClient.invalidateQueries(['dashboard']);
      },
      onError: () => {
        toast.error('Failed to remove from wishlist');
      },
    }
  );

  const enrollMutation = useMutation(
    (courseId) => CourseService.enrollInCourse(courseId),
    {
      onSuccess: () => {
        toast.success('Successfully enrolled in course!');
        queryClient.invalidateQueries(['dashboard']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to enroll');
      },
    }
  );

  const wishlistCourses = dashboardData?.dashboard?.wishlist || [];

  const handleRemoveFromWishlist = (courseId) => {
    removeFromWishlistMutation.mutate(courseId);
  };

  const handleEnroll = (courseId) => {
    enrollMutation.mutate(courseId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading wishlist..." />
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
              My Wishlist
            </h1>
            <p className="text-secondary-600">
              {wishlistCourses.length} courses saved for later
            </p>
          </motion.div>
        </div>

        {/* Wishlist Content */}
        {wishlistCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <HeartIcon className="w-24 h-24 text-secondary-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              Your wishlist is empty
            </h3>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              Save courses you're interested in to your wishlist and come back to them later.
            </p>
            <Link to="/courses" className="btn-primary btn-lg">
              Browse Courses
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {wishlistCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Course Image */}
                  <div className="md:w-80 flex-shrink-0">
                    <img
                      src={course.thumbnail || '/api/placeholder/320/180'}
                      alt={course.title}
                      className="w-full h-48 md:h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="badge-primary text-xs">
                            {course.category}
                          </span>
                          <span className="badge-secondary text-xs">
                            {course.level}
                          </span>
                        </div>
                        
                        <Link
                          to={`/courses/${course._id}`}
                          className="block hover:text-primary-600 transition-colors"
                        >
                          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                            {course.title}
                          </h3>
                        </Link>
                        
                        <p className="text-secondary-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <p className="text-sm text-secondary-600 mb-4">
                          By {course.instructor?.name}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromWishlist(course._id)}
                        disabled={removeFromWishlistMutation.isLoading}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from wishlist"
                      >
                        {removeFromWishlistMutation.isLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <HeartSolidIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">
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
                      
                      <div className="flex items-center text-sm text-secondary-500">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {course.enrollmentCount || 0} students
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/courses/${course._id}`}
                          className="btn-outline btn-sm"
                        >
                          View Details
                        </Link>
                        
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={enrollMutation.isLoading}
                          className="btn-primary btn-sm flex items-center"
                        >
                          {enrollMutation.isLoading ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            <>
                              <ShoppingCartIcon className="w-4 h-4 mr-2" />
                              {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Wishlist Actions */}
        {wishlistCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="card inline-block">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Ready to start learning?
                </h3>
                <p className="text-secondary-600 mb-4">
                  Browse more courses to add to your collection
                </p>
                <Link to="/courses" className="btn-primary">
                  Discover More Courses
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
