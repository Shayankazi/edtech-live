import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { CourseService } from '../services/api';
import {
  PlayIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage = () => {
  // Fetch featured courses
  const { data: coursesData, isLoading } = useQuery(
    ['featured-courses'],
    () => CourseService.getCourses({ limit: 8, sortBy: 'popular' }),
    { staleTime: 10 * 60 * 1000 } // 10 minutes
  );

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Learning',
      description: 'Get personalized summaries, auto-generated notes, and smart recommendations.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experienced educators.',
    },
    {
      icon: ChartBarIcon,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics and achievements.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Learn Anywhere',
      description: 'Access courses on any device, anytime, anywhere in the world.',
    },
  ];

  const stats = [
    { label: 'Active Students', value: '50,000+' },
    { label: 'Courses Available', value: '1,200+' },
    { label: 'Expert Instructors', value: '500+' },
    { label: 'Countries Reached', value: '100+' },
  ];

  const categories = [
    { name: 'Programming', count: 245, color: 'bg-blue-500' },
    { name: 'Design', count: 189, color: 'bg-purple-500' },
    { name: 'Business', count: 156, color: 'bg-green-500' },
    { name: 'Marketing', count: 134, color: 'bg-orange-500' },
    { name: 'Data Science', count: 98, color: 'bg-red-500' },
    { name: 'AI & ML', count: 87, color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                Learn Without
                <span className="block text-gradient bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              <p className="text-xl text-primary-100 mb-8 max-w-lg">
                Master new skills with AI-powered learning. Get personalized summaries, 
                smart recommendations, and learn at your own pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="btn-lg bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-glow"
                >
                  Explore Courses
                </Link>
                <Link
                  to="/register"
                  className="btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold px-8 py-4 rounded-xl transition-all duration-200"
                >
                  Start Learning Free
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="aspect-video bg-secondary-900 rounded-xl flex items-center justify-center mb-6">
                  <PlayIcon className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-100">Course Progress</span>
                    <span className="text-white font-semibold">75%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-gradient-to-r from-yellow-400 to-orange-400" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-primary-100">
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      2h 30m left
                    </span>
                    <span className="flex items-center">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      1,234 students
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce-in">
                <SparklesIcon className="w-8 h-8 text-yellow-900" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center animate-pulse-slow">
                <AcademicCapIcon className="w-6 h-6 text-orange-900" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-secondary-200">
        <div className="container-custom py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-secondary-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-secondary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Experience the future of online learning with AI-powered features 
              designed to accelerate your learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center group hover:shadow-glow transition-all duration-300"
              >
                <div className="card-body">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-secondary-600">
              Discover courses across various domains and skill levels
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/courses?category=${category.name.toLowerCase().replace(' ', '_')}`}
                  className="card-hover group text-center block"
                >
                  <div className="card-body">
                    <div className={`w-12 h-12 ${category.color} rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}></div>
                    <h3 className="font-semibold text-secondary-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {category.count} courses
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="section-padding bg-secondary-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
                Popular Courses
              </h2>
              <p className="text-xl text-secondary-600">
                Join thousands of students in these trending courses
              </p>
            </div>
            <Link
              to="/courses"
              className="btn-outline hidden md:inline-flex"
            >
              View All Courses
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading courses..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coursesData?.courses?.slice(0, 8).map((course, index) => (
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
                            {course.rating?.average || 0}
                          </span>
                          <span className="text-sm text-secondary-500 ml-1">
                            ({course.rating?.count || 0})
                          </span>
                        </div>
                        <span className="badge-primary">
                          {course.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                        <span className="text-sm text-secondary-500">
                          {course.enrollmentCount} students
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 md:hidden">
            <Link to="/courses" className="btn-primary">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join millions of learners and start your journey today. 
            Get access to AI-powered features and expert instruction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-lg bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/courses"
              className="btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
