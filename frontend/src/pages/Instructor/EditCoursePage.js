import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { CourseService } from '../../services/api';
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  ChevronLeftIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import VideoUpload from '../../components/Course/VideoUpload';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');

  const { data: courseData, isLoading } = useQuery(
    ['course', id],
    () => CourseService.getCourse(id),
    { enabled: !!id }
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: courseData?.course || {},
  });

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: 'sections',
  });

  const updateCourseMutation = useMutation(
    (data) => CourseService.updateCourse(id, data),
    {
      onSuccess: () => {
        toast.success('Course updated successfully!');
        queryClient.invalidateQueries(['course', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update course');
      },
    }
  );

  const onSubmit = (data) => {
    updateCourseMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    );
  }

  const course = courseData?.course;
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <button onClick={() => navigate('/instructor/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: PencilIcon },
    { id: 'content', label: 'Content', icon: VideoCameraIcon },
    { id: 'settings', label: 'Settings', icon: DocumentTextIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="btn-outline btn-sm"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Course
              </h1>
            </div>
            <p className="text-gray-600">{course.title}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="btn-outline"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || updateCourseMutation.isLoading}
              className="btn-primary"
            >
              {updateCourseMutation.isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Information
                </h2>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="input resize-none"
                    {...register('description', { required: 'Description is required' })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="input" {...register('category')}>
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select className="input" {...register('level')}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      {...register('price')}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Section {sectionIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          className="input"
                          {...register(`sections.${sectionIndex}.title`)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          className="input"
                          {...register(`sections.${sectionIndex}.description`)}
                        />
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Lessons</h4>
                      {section.lessons?.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Lesson Title
                              </label>
                              <input
                                type="text"
                                className="input input-sm"
                                {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.title`)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Duration (min)
                              </label>
                              <input
                                type="number"
                                className="input input-sm"
                                {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.duration`)}
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              Video Content
                            </label>
                            <VideoUpload
                              existingVideoUrl={lesson.videoUrl}
                              lessonId={lesson._id}
                              onUploadComplete={(response) => {
                                setValue(
                                  `sections.${sectionIndex}.lessons.${lessonIndex}.videoUrl`,
                                  response.videoUrl
                                );
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendSection({ title: '', lessons: [{ title: '', videoUrl: '' }] })}
                className="btn-outline w-full"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Section
              </button>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Settings
                </h2>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      {...register('isPublished')}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Published (visible to students)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      {...register('allowComments')}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Allow student comments
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      {...register('generateCertificate')}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Generate completion certificates
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;
