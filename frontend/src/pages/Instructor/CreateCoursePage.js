import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from 'react-query';
import { CourseService } from '../../services/api';
import {
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import VideoUpload from '../../components/Course/VideoUpload';
import toast from 'react-hot-toast';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      price: 0,
      thumbnail: null,
      sections: [
        {
          title: '',
          description: '',
          order: 1,
          lessons: [
            {
              title: '',
              description: '',
              type: 'video',
              content: '',
              videoUrl: '',
              duration: 0,
              order: 1,
            },
          ],
        },
      ],
    },
  });

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: 'sections',
  });

  const createCourseMutation = useMutation(
    (courseData) => CourseService.createCourse(courseData),
    {
      onSuccess: (response) => {
        toast.success('Course created successfully!');
        navigate('/courses');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create course');
      },
    }
  );

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Process sections to ensure proper structure
      const processedSections = (data.sections || []).map((section, sectionIndex) => ({
        ...section,
        order: sectionIndex + 1,
        lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
          ...lesson,
          order: lessonIndex + 1,
          videoUrl: lesson.content || lesson.videoUrl || '',
          duration: parseInt(lesson.duration) || 0
        }))
      }));

      const courseData = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        price: data.price || 0,
        sections: processedSections
      };
      
      // Add thumbnail URL if exists
      if (data.thumbnail) {
        courseData.thumbnail = data.thumbnail;
      }
      
      console.log('Submitting course data:', courseData);
      createCourseMutation.mutate(courseData);
    } catch (error) {
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue('thumbnail', file);
        setThumbnailPreview(URL.createObjectURL(file));
      }
    },
  });

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Course details and thumbnail' },
    { id: 2, title: 'Content', description: 'Sections and lessons' },
    { id: 3, title: 'Review', description: 'Review and publish' },
  ];

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

  const levels = ['beginner', 'intermediate', 'advanced'];

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const addSection = () => {
    const currentSections = watch('sections') || [];
    appendSection({
      title: '',
      description: '',
      order: currentSections.length + 1,
      lessons: [
        {
          title: '',
          description: '',
          type: 'video',
          content: '',
          videoUrl: '',
          duration: 0,
          order: 1,
        },
      ],
    });
  };

  const addLesson = (sectionIndex) => {
    const currentSections = watch('sections');
    const updatedSections = [...currentSections];
    const currentLessons = updatedSections[sectionIndex].lessons || [];
    updatedSections[sectionIndex].lessons.push({
      title: '',
      description: '',
      type: 'video',
      content: '',
      videoUrl: '',
      duration: 0,
      order: currentLessons.length + 1,
    });
    setValue('sections', updatedSections);
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    const currentSections = watch('sections');
    const updatedSections = [...currentSections];
    updatedSections[sectionIndex].lessons.splice(lessonIndex, 1);
    setValue('sections', updatedSections);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Course
              </h1>
              <p className="text-gray-600">
                Share your knowledge and create an engaging learning experience
              </p>
            </div>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="btn-outline"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3 text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 mx-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card"
              >
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Course Information
                  </h2>
                </div>
                <div className="card-body space-y-6">
                  {/* Course Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.title ? 'input-error' : ''}`}
                      placeholder="Enter course title"
                      {...register('title', {
                        required: 'Course title is required',
                        minLength: {
                          value: 5,
                          message: 'Title must be at least 5 characters',
                        },
                      })}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Course Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Description *
                    </label>
                    <textarea
                      rows={4}
                      className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                      placeholder="Describe what students will learn in this course"
                      {...register('description', {
                        required: 'Course description is required',
                        minLength: {
                          value: 20,
                          message: 'Description must be at least 20 characters',
                        },
                      })}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        className={`input ${errors.category ? 'input-error' : ''}`}
                        {...register('category', {
                          required: 'Please select a category',
                        })}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category.toLowerCase().replace(' ', '_')}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    {/* Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level *
                      </label>
                      <select
                        className="input"
                        {...register('level')}
                      >
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input pl-8"
                        placeholder="0.00"
                        {...register('price', {
                          min: {
                            value: 0,
                            message: 'Price cannot be negative',
                          },
                        })}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Set to $0 for a free course
                    </p>
                  </div>

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Thumbnail
                    </label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setThumbnailPreview(null);
                              setValue('thumbnail', null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            {isDragActive
                              ? 'Drop the image here'
                              : 'Drag & drop an image here, or click to select'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Course Content
                      </h2>
                      <button
                        type="button"
                        onClick={addSection}
                        className="btn-primary btn-sm"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Section
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {sections.map((section, sectionIndex) => (
                      <div key={section.id} className="mb-8 last:mb-0">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              Section {sectionIndex + 1}
                            </h3>
                            {sections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSection(sectionIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section Title *
                              </label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Enter section title"
                                {...register(`sections.${sectionIndex}.title`, {
                                  required: 'Section title is required',
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section Description
                              </label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Brief description"
                                {...register(`sections.${sectionIndex}.description`)}
                              />
                            </div>
                          </div>

                          {/* Lessons */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-md font-medium text-gray-800">
                                Lessons
                              </h4>
                              <button
                                type="button"
                                onClick={() => addLesson(sectionIndex)}
                                className="btn-outline btn-sm"
                              >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Add Lesson
                              </button>
                            </div>
                            
                            {watch(`sections.${sectionIndex}.lessons`)?.map((lesson, lessonIndex) => (
                              <div key={lessonIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-medium text-gray-700">
                                    Lesson {lessonIndex + 1}
                                  </h5>
                                  {watch(`sections.${sectionIndex}.lessons`).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeLesson(sectionIndex, lessonIndex)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Lesson Title *
                                    </label>
                                    <input
                                      type="text"
                                      className="input input-sm"
                                      placeholder="Enter lesson title"
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.title`, {
                                        required: 'Lesson title is required',
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Type
                                    </label>
                                    <select
                                      className="input input-sm"
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.type`)}
                                    >
                                      <option value="video">Video</option>
                                      <option value="text">Text</option>
                                      <option value="quiz">Quiz</option>
                                    </select>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    rows={2}
                                    className="input input-sm resize-none"
                                    placeholder="Lesson description"
                                    {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.description`)}
                                  />
                                </div>
                                
                                <div className="mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Duration (minutes)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      className="input input-sm"
                                      placeholder="0"
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.duration`)}
                                    />
                                  </div>
                                </div>
                                
                                {/* Video Upload Section */}
                                {watch(`sections.${sectionIndex}.lessons.${lessonIndex}.type`) === 'video' && (
                                  <div className="mt-4">
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                      Upload Video
                                    </label>
                                    <VideoUpload
                                      onUploadComplete={(response) => {
                                        setValue(`sections.${sectionIndex}.lessons.${lessonIndex}.content`, response.videoUrl);
                                        setValue(`sections.${sectionIndex}.lessons.${lessonIndex}.videoUrl`, response.videoUrl);
                                        toast.success('Video uploaded successfully!');
                                      }}
                                      onUploadStart={(file) => {
                                        toast('Uploading video...');
                                      }}
                                      lessonId={`${sectionIndex}-${lessonIndex}`}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card"
              >
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Review & Publish
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-6">
                    {/* Course Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Course Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Title</p>
                          <p className="font-medium">{watch('title') || 'Untitled Course'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-medium">{watch('category') || 'Not selected'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Level</p>
                          <p className="font-medium capitalize">{watch('level')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="font-medium">
                            {watch('price') > 0 ? `$${watch('price')}` : 'Free'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="font-medium">{watch('description') || 'No description'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Content Overview
                      </h3>
                      <div className="space-y-3">
                        {watch('sections')?.map((section, index) => (
                          <div key={index} className="bg-white rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Section {index + 1}: {section.title || 'Untitled Section'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {section.lessons?.length || 0} lesson(s)
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {section.lessons?.map((lesson, lessonIndex) => (
                                <li key={lessonIndex} className="flex items-center">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                  {lesson.title || `Lesson ${lessonIndex + 1}`}
                                  {lesson.duration > 0 && (
                                    <span className="ml-auto text-xs">
                                      {lesson.duration} min
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Publish Options */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Ready to Publish?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Once published, students will be able to enroll in your course. 
                        You can always edit the content later.
                      </p>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            {...register('publishImmediately')}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Publish immediately
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || createCourseMutation.isLoading}
                  className="btn-primary btn-lg"
                >
                  {isSubmitting || createCourseMutation.isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <BookOpenIcon className="w-5 h-5 mr-2" />
                      Create Course
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
