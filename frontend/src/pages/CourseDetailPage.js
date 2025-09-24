import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CourseService, UserService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getVideoUrl } from '../config/api';
import {
  PlayIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  ShareIcon,
  CheckIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const { data: course, isLoading, error } = useQuery(
    ['course', id],
    async () => {
      const response = await CourseService.getCourse(id);
      console.log('Course Detail - API Response:', response.data);
      return response.data;
    },
    { 
      enabled: !!id,
      onSuccess: (data) => {
        // Check if course is in user's wishlist
        if (user?.wishlist?.includes(data._id)) {
          setIsWishlisted(true);
        }
      }
    }
  );

  const enrollMutation = useMutation(
    () => CourseService.enrollInCourse(id),
    {
      onSuccess: () => {
        toast.success('Successfully enrolled in course!');
        queryClient.invalidateQueries(['course', id]);
        navigate(`/learn/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to enroll');
      },
    }
  );

  const wishlistMutation = useMutation(
    (action) => {
      return action === 'add' 
        ? UserService.addToWishlist(id)
        : UserService.removeFromWishlist(id);
    },
    {
      onSuccess: (_, action) => {
        setIsWishlisted(action === 'add');
        toast.success(
          action === 'add' 
            ? 'Added to wishlist!' 
            : 'Removed from wishlist!'
        );
        queryClient.invalidateQueries(['dashboard']);
      },
      onError: () => {
        toast.error('Failed to update wishlist');
      },
    }
  );

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    enrollMutation.mutate();
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    wishlistMutation.mutate(isWishlisted ? 'remove' : 'add');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title,
          text: course?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Course not found
          </h2>
          <p className="text-secondary-600 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const courseData = course;
  const isEnrolled = courseData.isEnrolled;
  const canAccess = isEnrolled || courseData.price === 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-secondary-900 text-white">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <span className="badge bg-primary-600 text-white">
                    {courseData.category}
                  </span>
                  <span className="badge bg-secondary-700 text-secondary-300">
                    {courseData.level}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {courseData.title}
                </h1>
                
                <p className="text-xl text-secondary-300 mb-6">
                  {courseData.description}
                </p>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold mr-1">
                      {courseData.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-secondary-400">
                      ({courseData.rating?.count || 0} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-secondary-300">
                    <UsersIcon className="w-5 h-5 mr-1" />
                    {courseData.enrollmentCount || 0} students
                  </div>
                  
                  <div className="flex items-center text-secondary-300">
                    <ClockIcon className="w-5 h-5 mr-1" />
                    {courseData.totalDuration || 0} minutes
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <img
                    src={courseData.instructor?.avatar || '/api/placeholder/40/40'}
                    alt={courseData.instructor?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      Created by {courseData.instructor?.name}
                    </p>
                    <p className="text-sm text-secondary-400">
                      {courseData.instructor?.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card sticky top-8"
              >
                <div className="relative">
                  <img
                    src={courseData.thumbnail || '/api/placeholder/400/240'}
                    alt={courseData.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-t-xl">
                    <PlayIcon className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {courseData.price === 0 ? 'Free' : `$${courseData.price}`}
                    </div>
                    {courseData.price > 0 && (
                      <p className="text-sm text-secondary-600">
                        One-time payment • Lifetime access
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {isEnrolled ? (
                      <Link
                        to={`/learn/${courseData._id}`}
                        className="btn-primary w-full btn-lg"
                      >
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrollMutation.isLoading}
                        className="btn-primary w-full btn-lg"
                      >
                        {enrollMutation.isLoading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : courseData.price === 0 ? (
                          'Enroll for Free'
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleWishlist}
                        disabled={wishlistMutation.isLoading}
                        className="btn-outline flex-1 flex items-center justify-center"
                      >
                        {isWishlisted ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-500 mr-2" />
                        ) : (
                          <HeartIcon className="w-5 h-5 mr-2" />
                        )}
                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="btn-outline flex items-center justify-center px-4"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <BookOpenIcon className="w-5 h-5 text-secondary-600 mr-3" />
                      {courseData.totalLessons || 0} lessons
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-secondary-600 mr-3" />
                      {Math.floor((courseData.totalDuration || 0) / 60)}h {(courseData.totalDuration || 0) % 60}m total
                    </div>
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-5 h-5 text-secondary-600 mr-3" />
                      English with subtitles
                    </div>
                    <div className="flex items-center">
                      <TrophyIcon className="w-5 h-5 text-secondary-600 mr-3" />
                      Certificate of completion
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-secondary-200 mb-8">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="prose max-w-none">
                    <h3>What you'll learn</h3>
                    <ul>
                      <li>Master the fundamentals of the subject</li>
                      <li>Build practical projects from scratch</li>
                      <li>Apply best practices and industry standards</li>
                      <li>Gain confidence in real-world applications</li>
                    </ul>
                    
                    <h3>Course Description</h3>
                    <p>{courseData.description}</p>
                    
                    <h3>Requirements</h3>
                    <ul>
                      <li>Basic computer skills</li>
                      <li>Enthusiasm to learn</li>
                      <li>No prior experience required</li>
                    </ul>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'curriculum' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-4">
                    {courseData.sections?.map((section, sectionIndex) => (
                      <div key={section._id} className="card">
                        <div className="card-header">
                          <h4 className="font-semibold text-secondary-900">
                            Section {sectionIndex + 1}: {section.title}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            {section.lessons?.length || 0} lessons • {section.duration || 0} min
                          </p>
                        </div>
                        <div className="card-body">
                          <div className="space-y-2">
                            {section.lessons?.map((lesson, lessonIndex) => (
                              <div
                                key={lesson._id}
                                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100"
                                onClick={() => {
                                  if (lesson.videoUrl || lesson.content) {
                                    const videoPath = lesson.videoUrl || lesson.content;
                                    const fullUrl = getVideoUrl(videoPath);
                                    setSelectedVideo({
                                      url: fullUrl,
                                      title: lesson.title,
                                      description: lesson.description
                                    });
                                    setShowVideoPlayer(true);
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  <PlayIcon className="w-4 h-4 text-secondary-600 mr-3" />
                                  <span className="text-sm font-medium">
                                    {lessonIndex + 1}. {lesson.title}
                                  </span>
                                  {(lesson.videoUrl || lesson.content) && (
                                    <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                                      Video Available
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-secondary-500">
                                    {lesson.duration || 0} min
                                  </span>
                                  {canAccess && (
                                    <CheckIcon className="w-4 h-4 text-success-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'instructor' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="card">
                    <div className="card-body">
                      <div className="flex items-start space-x-4">
                        <img
                          src={courseData.instructor?.avatar || '/api/placeholder/80/80'}
                          alt={courseData.instructor?.name}
                          className="w-20 h-20 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                            {courseData.instructor?.name}
                          </h3>
                          <p className="text-secondary-600 mb-4">
                            {courseData.instructor?.bio || 'Experienced instructor passionate about teaching.'}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-secondary-600">
                            <div className="flex items-center">
                              <AcademicCapIcon className="w-4 h-4 mr-1" />
                              {courseData.instructor?.totalStudents || 0} students
                            </div>
                            <div className="flex items-center">
                              <BookOpenIcon className="w-4 h-4 mr-1" />
                              {courseData.instructor?.totalCourses || 0} courses
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1" />
                              {courseData.instructor?.rating || 0} rating
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-6">
                    {courseData.reviews?.length > 0 ? (
                      courseData.reviews.map((review) => (
                        <div key={review._id} className="card">
                          <div className="card-body">
                            <div className="flex items-start space-x-4">
                              <img
                                src={review.user?.avatar || '/api/placeholder/40/40'}
                                alt={review.user?.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-secondary-900">
                                    {review.user?.name}
                                  </h4>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-secondary-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-secondary-700">
                                  {review.comment}
                                </p>
                                <p className="text-xs text-secondary-500 mt-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <StarIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">
                          No reviews yet
                        </h3>
                        <p className="text-secondary-600">
                          Be the first to review this course!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Sidebar - Related Courses */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-secondary-900">
                  Related Courses
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Placeholder for related courses */}
                  <div className="text-center py-4">
                    <BookOpenIcon className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-600">
                      Related courses will appear here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-secondary-900">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setSelectedVideo(null);
                }}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-lg mb-4">
              <video
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                src={selectedVideo.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {selectedVideo.description && (
              <div className="text-secondary-600">
                <h4 className="font-medium mb-2">Description:</h4>
                <p>{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
