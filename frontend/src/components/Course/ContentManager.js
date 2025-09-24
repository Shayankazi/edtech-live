import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { CourseService } from '../../services/api';
import {
  DocumentTextIcon,
  SparklesIcon,
  LanguageIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ContentManager = ({ courseId, lessons }) => {
  const [processingStatus, setProcessingStatus] = useState({});
  const queryClient = useQueryClient();

  const generateTranscriptionMutation = useMutation(
    (videoId) => CourseService.generateTranscription(videoId),
    {
      onMutate: (videoId) => {
        setProcessingStatus(prev => ({ ...prev, [videoId]: 'transcribing' }));
      },
      onSuccess: (_, videoId) => {
        setProcessingStatus(prev => ({ ...prev, [videoId]: 'completed' }));
        toast.success('Transcription generated successfully!');
        queryClient.invalidateQueries(['course', courseId]);
      },
      onError: (error, videoId) => {
        setProcessingStatus(prev => ({ ...prev, [videoId]: 'error' }));
        toast.error('Failed to generate transcription');
      },
    }
  );

  const generateSummaryMutation = useMutation(
    () => CourseService.generateSummary(courseId),
    {
      onSuccess: () => {
        toast.success('Course summary generated!');
        queryClient.invalidateQueries(['course', courseId]);
      },
      onError: () => {
        toast.error('Failed to generate summary');
      },
    }
  );

  const generateQuizMutation = useMutation(
    (lessonId) => CourseService.generateQuiz(lessonId),
    {
      onSuccess: () => {
        toast.success('Quiz generated successfully!');
        queryClient.invalidateQueries(['course', courseId]);
      },
      onError: () => {
        toast.error('Failed to generate quiz');
      },
    }
  );

  const aiFeatures = [
    {
      id: 'transcription',
      title: 'Auto Transcription',
      description: 'Generate accurate transcriptions for all video lessons',
      icon: DocumentTextIcon,
      action: 'Generate Transcriptions',
      color: 'blue',
      available: lessons?.some(l => l.videoUrl && !l.transcription),
    },
    {
      id: 'summary',
      title: 'Course Summary',
      description: 'Create AI-powered course summaries and key points',
      icon: SparklesIcon,
      action: 'Generate Summary',
      color: 'purple',
      available: true,
    },
    {
      id: 'translation',
      title: 'Multi-language Support',
      description: 'Translate captions and content to multiple languages',
      icon: LanguageIcon,
      action: 'Add Languages',
      color: 'green',
      available: lessons?.some(l => l.transcription),
    },
    {
      id: 'quiz',
      title: 'Auto Quiz Generation',
      description: 'Generate practice quizzes from lesson content',
      icon: QuestionMarkCircleIcon,
      action: 'Generate Quizzes',
      color: 'orange',
      available: lessons?.length > 0,
    },
  ];

  const handleFeatureAction = (feature) => {
    switch (feature.id) {
      case 'transcription':
        // Generate transcriptions for all videos
        lessons?.forEach(lesson => {
          if (lesson.videoUrl && !lesson.transcription) {
            generateTranscriptionMutation.mutate(lesson._id);
          }
        });
        break;
      case 'summary':
        generateSummaryMutation.mutate();
        break;
      case 'quiz':
        // Generate quizzes for all lessons
        lessons?.forEach(lesson => {
          if (!lesson.quiz) {
            generateQuizMutation.mutate(lesson._id);
          }
        });
        break;
      default:
        toast.info('Feature coming soon!');
    }
  };

  const getFeatureStatus = (feature) => {
    if (feature.id === 'transcription') {
      const processingCount = Object.values(processingStatus).filter(s => s === 'transcribing').length;
      if (processingCount > 0) return 'processing';
      
      const completedCount = lessons?.filter(l => l.transcription).length || 0;
      const totalCount = lessons?.filter(l => l.videoUrl).length || 0;
      if (completedCount === totalCount && totalCount > 0) return 'completed';
    }
    
    return 'available';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <LoadingSpinner size="sm" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <PlayIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            AI-Powered Content Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Enhance your course with AI-generated content and features
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiFeatures.map((feature) => {
              const status = getFeatureStatus(feature);
              const isProcessing = status === 'processing';
              const isCompleted = status === 'completed';
              const isAvailable = feature.available && status === 'available';

              return (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'border-green-200 bg-green-50'
                      : isProcessing
                      ? 'border-blue-200 bg-blue-50'
                      : isAvailable
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      feature.color === 'blue' ? 'bg-blue-100' :
                      feature.color === 'purple' ? 'bg-purple-100' :
                      feature.color === 'green' ? 'bg-green-100' :
                      feature.color === 'orange' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        feature.color === 'blue' ? 'text-blue-600' :
                        feature.color === 'purple' ? 'text-purple-600' :
                        feature.color === 'green' ? 'text-green-600' :
                        feature.color === 'orange' ? 'text-orange-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleFeatureAction(feature)}
                          disabled={!isAvailable || isProcessing}
                          className={`btn btn-sm flex items-center ${
                            isCompleted
                              ? 'btn-success'
                              : isProcessing
                              ? 'btn-secondary'
                              : isAvailable
                              ? 'btn-primary'
                              : 'btn-ghost opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {getStatusIcon(status)}
                          <span className="ml-2">
                            {isCompleted
                              ? 'Completed'
                              : isProcessing
                              ? 'Processing...'
                              : feature.action
                            }
                          </span>
                        </button>
                        
                        {feature.id === 'transcription' && (
                          <div className="text-xs text-gray-500">
                            {lessons?.filter(l => l.transcription).length || 0} / {lessons?.filter(l => l.videoUrl).length || 0} videos
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {Object.keys(processingStatus).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Processing Status
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {Object.entries(processingStatus).map(([lessonId, status]) => {
                const lesson = lessons?.find(l => l._id === lessonId);
                return (
                  <div key={lessonId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {lesson?.title || 'Unknown Lesson'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {status === 'transcribing' && 'Generating transcription...'}
                          {status === 'completed' && 'Transcription completed'}
                          {status === 'error' && 'Processing failed'}
                        </p>
                      </div>
                    </div>
                    
                    {status === 'completed' && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Done
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            AI Features Guide
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Auto Transcription</p>
                <p>Automatically generates accurate transcriptions for all video content using AI speech recognition.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <SparklesIcon className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Smart Summaries</p>
                <p>Creates concise summaries and key takeaways from your course content to help students learn faster.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <LanguageIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Multi-language Support</p>
                <p>Translate captions and course materials to reach a global audience.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <QuestionMarkCircleIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Auto Quiz Generation</p>
                <p>Generate practice questions and assessments based on your lesson content.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
