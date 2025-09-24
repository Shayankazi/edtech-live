import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { UserService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    interests: user?.interests?.join(', ') || '',
  });

  const { data: learningStats, isLoading: statsLoading } = useQuery(
    ['learning-stats'],
    UserService.getLearningStats,
    { staleTime: 10 * 60 * 1000 }
  );

  const updateProfileMutation = useMutation(
    (data) => UserService.updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries(['learning-stats']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = {
      ...formData,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
    };
    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      interests: user?.interests?.join(', ') || '',
    });
    setIsEditing(false);
  };

  const stats = learningStats?.stats;

  const achievementsList = [
    { 
      id: 'first_course', 
      title: 'First Course Completed', 
      description: 'Completed your first course',
      icon: '🎓',
      earned: user?.achievements?.some(a => a.type === 'first_course')
    },
    { 
      id: 'streak_7', 
      title: '7-Day Streak', 
      description: 'Learned for 7 consecutive days',
      icon: '🔥',
      earned: user?.achievements?.some(a => a.type === 'streak_7')
    },
    { 
      id: 'streak_30', 
      title: '30-Day Streak', 
      description: 'Learned for 30 consecutive days',
      icon: '⚡',
      earned: user?.achievements?.some(a => a.type === 'streak_30')
    },
    { 
      id: 'course_master', 
      title: 'Course Master', 
      description: 'Completed 5 courses',
      icon: '🏆',
      earned: (user?.completedCourses?.length || 0) >= 5
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card"
            >
              <div className="card-body text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <UserCircleIcon className="w-24 h-24 text-secondary-400 mx-auto" />
                  )}
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* User Info */}
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input text-center"
                      placeholder="Your name"
                      required
                    />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input text-center resize-none"
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                      className="input text-center"
                      placeholder="Your interests (comma separated)"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isLoading}
                        className="btn-primary btn-sm flex-1"
                      >
                        {updateProfileMutation.isLoading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-outline btn-sm flex-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                      {user?.name}
                    </h2>
                    <p className="text-secondary-600 mb-4">
                      {user?.bio || 'No bio added yet'}
                    </p>
                    <div className="flex items-center justify-center mb-4">
                      <span className="badge-primary">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-outline btn-sm"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  </>
                )}

                {/* Interests */}
                {user?.interests?.length > 0 && !isEditing && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-secondary-700 mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {user.interests.map((interest, index) => (
                        <span key={index} className="badge-secondary text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <p className="text-sm text-secondary-600">
                    Member since {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-xl font-semibold text-secondary-900">
                  Learning Statistics
                </h3>
              </div>
              <div className="card-body">
                {statsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <BookOpenIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {stats?.totalCourses || 0}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Enrolled Courses
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <TrophyIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {stats?.completedCourses || 0}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Completed
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <ClockIcon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {Math.floor((stats?.totalWatchTime || 0) / 60)}h
                      </div>
                      <div className="text-sm text-secondary-600">
                        Watch Time
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <ChartBarIcon className="w-8 h-8 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {stats?.currentStreak || 0}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Day Streak
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-xl font-semibold text-secondary-900">
                  Achievements
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementsList.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.earned
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-secondary-200 bg-secondary-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            achievement.earned ? 'text-yellow-800' : 'text-secondary-600'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${
                            achievement.earned ? 'text-yellow-700' : 'text-secondary-500'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <CheckIcon className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Learning Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h3 className="text-xl font-semibold text-secondary-900">
                  Recent Activity
                </h3>
              </div>
              <div className="card-body">
                {stats?.recentActivity?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg">
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-secondary-900 mb-2">
                      No recent activity
                    </h4>
                    <p className="text-secondary-600">
                      Start learning to see your progress here!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
