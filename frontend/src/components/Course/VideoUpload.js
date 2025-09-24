import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from 'react-query';
import { CourseService } from '../../services/api';
import {
  VideoCameraIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

const VideoUpload = ({ onUploadComplete, onUploadStart, existingVideoUrl, lessonId }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [videoPreview, setVideoPreview] = useState(existingVideoUrl || null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);

  const uploadMutation = useMutation(
    async (formData) => {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      return CourseService.uploadVideo(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
    },
    {
      onSuccess: (response) => {
        setUploadStatus('processing');
        setProcessingStatus('Transcribing audio...');
        
        // Poll for processing status
        pollProcessingStatus(response.uploadId);
        
        if (onUploadComplete) {
          onUploadComplete(response);
        }
      },
      onError: (error) => {
        setUploadStatus('error');
        toast.error(error.response?.data?.message || 'Upload failed');
      },
    }
  );

  const pollProcessingStatus = async (uploadId) => {
    try {
      const response = await CourseService.getUploadStatus(uploadId);
      
      if (response.status === 'completed') {
        setUploadStatus('completed');
        setProcessingStatus('Processing complete!');
        setVideoPreview(response.videoUrl);
        toast.success('Video uploaded and processed successfully!');
      } else if (response.status === 'processing') {
        setProcessingStatus(response.stage || 'Processing video...');
        setTimeout(() => pollProcessingStatus(uploadId), 2000);
      } else if (response.status === 'error') {
        setUploadStatus('error');
        toast.error('Video processing failed');
      }
    } catch (error) {
      console.error('Error polling status:', error);
      setTimeout(() => pollProcessingStatus(uploadId), 5000);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        toast.error('File is too large. Maximum size is 500MB.');
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        toast.error('Invalid file type. Please upload MP4, MOV, or AVI files.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      
      // Start upload
      const formData = new FormData();
      formData.append('video', file);
      if (lessonId) {
        formData.append('lessonId', lessonId);
      }
      
      if (onUploadStart) {
        onUploadStart(file);
      }
      
      uploadMutation.mutate(formData);
    }
  }, [lessonId, onUploadStart, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
    disabled: uploadStatus === 'uploading' || uploadStatus === 'processing',
  });

  const removeVideo = () => {
    setVideoPreview(null);
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setProcessingStatus(null);
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <LoadingSpinner size="sm" />;
      case 'processing':
        return <LoadingSpinner size="sm" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <VideoCameraIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {!videoPreview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : uploadStatus === 'uploading' || uploadStatus === 'processing'
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            
            <div>
              <h3 className={`text-lg font-medium ${getStatusColor()}`}>
                {uploadStatus === 'uploading' && 'Uploading video...'}
                {uploadStatus === 'processing' && 'Processing video...'}
                {uploadStatus === 'error' && 'Upload failed'}
                {uploadStatus === 'idle' && (
                  isDragActive ? 'Drop video here' : 'Upload lesson video'
                )}
              </h3>
              
              {uploadStatus === 'idle' && (
                <p className="text-gray-600 mt-2">
                  Drag & drop a video file here, or click to browse
                </p>
              )}
              
              {uploadStatus === 'uploading' && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
              
              {uploadStatus === 'processing' && (
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-gray-600">
                      {processingStatus}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This may take a few minutes depending on video length
                  </p>
                </div>
              )}
            </div>
            
            {uploadStatus === 'idle' && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Supported formats: MP4, MOV, AVI, MKV, WebM</p>
                <p>Maximum file size: 500MB</p>
                <p>AI transcription and captions will be generated automatically</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={videoPreview}
              controls
              className="w-full h-64 object-contain"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Video overlay with status */}
            <AnimatePresence>
              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <LoadingSpinner size="lg" color="white" />
                    <p className="mt-4 text-lg font-medium">
                      {uploadStatus === 'uploading' && `Uploading... ${uploadProgress}%`}
                      {uploadStatus === 'processing' && processingStatus}
                    </p>
                    {uploadStatus === 'uploading' && (
                      <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Video info and actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile?.name || 'Uploaded Video'}
                </p>
                <p className="text-xs text-gray-500">
                  {uploadedFile && `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  {uploadStatus === 'completed' && ' • Processing complete'}
                  {uploadStatus === 'processing' && ` • ${processingStatus}`}
                </p>
              </div>
            </div>
            
            <button
              onClick={removeVideo}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove video"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* AI Features Status */}
          {uploadStatus === 'completed' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                AI Processing Complete
              </h4>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  <span>Video transcription generated</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  <span>Closed captions created</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  <span>Video optimized for streaming</span>
                </div>
              </div>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-2">
                Upload Failed
              </h4>
              <p className="text-sm text-red-800">
                There was an error processing your video. Please try uploading again.
              </p>
              <button
                onClick={removeVideo}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
