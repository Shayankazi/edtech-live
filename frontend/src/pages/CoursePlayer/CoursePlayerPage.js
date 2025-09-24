import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CourseService, ProgressService } from '../../services/api';
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const CoursePlayerPage = () => {
  const { courseId, sectionId, lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);

  // Fetch course data
  const { data: courseData, isLoading: courseLoading } = useQuery(
    ['course', courseId],
    () => CourseService.getCourse(courseId),
    { enabled: !!courseId }
  );

  // Fetch progress data
  const { data: progressData, isLoading: progressLoading } = useQuery(
    ['progress', courseId],
    () => ProgressService.getProgress(courseId),
    { enabled: !!courseId }
  );

  // Get current lesson
  const course = courseData?.course;
  const progress = progressData?.progress;
  
  const currentSection = course?.sections?.find(s => 
    sectionId ? s._id === sectionId : s.lessons?.some(l => l._id === lessonId)
  ) || course?.sections?.[0];
  
  const currentLesson = currentSection?.lessons?.find(l => l._id === lessonId) || 
                      currentSection?.lessons?.[0];

  // Mark lesson as complete mutation
  const completeLessonMutation = useMutation(
    (lessonData) => ProgressService.completeLesson(courseId, lessonData),
    {
      onSuccess: () => {
        toast.success('Lesson completed!');
        queryClient.invalidateQueries(['progress', courseId]);
      },
      onError: () => {
        toast.error('Failed to mark lesson as complete');
      },
    }
  );

  // Add note mutation
  const addNoteMutation = useMutation(
    (noteData) => ProgressService.addNote(courseId, noteData),
    {
      onSuccess: () => {
        toast.success('Note added!');
        setNoteText('');
        setShowNotes(false);
        queryClient.invalidateQueries(['progress', courseId]);
      },
      onError: () => {
        toast.error('Failed to add note');
      },
    }
  );

  // Add bookmark mutation
  const addBookmarkMutation = useMutation(
    (bookmarkData) => ProgressService.addBookmark(courseId, bookmarkData),
    {
      onSuccess: () => {
        toast.success('Bookmark added!');
        queryClient.invalidateQueries(['progress', courseId]);
      },
      onError: () => {
        toast.error('Failed to add bookmark');
      },
    }
  );

  // Navigation functions
  const goToNextLesson = () => {
    const allLessons = course?.sections?.flatMap(s => 
      s.lessons?.map(l => ({ ...l, sectionId: s._id }))
    ) || [];
    
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson?._id);
    const nextLesson = allLessons[currentIndex + 1];
    
    if (nextLesson) {
      navigate(`/learn/${courseId}/${nextLesson.sectionId}/${nextLesson._id}`);
    }
  };

  const goToPreviousLesson = () => {
    const allLessons = course?.sections?.flatMap(s => 
      s.lessons?.map(l => ({ ...l, sectionId: s._id }))
    ) || [];
    
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson?._id);
    const previousLesson = allLessons[currentIndex - 1];
    
    if (previousLesson) {
      navigate(`/learn/${courseId}/${previousLesson.sectionId}/${previousLesson._id}`);
    }
  };

  const handleLessonComplete = () => {
    if (currentLesson) {
      completeLessonMutation.mutate({
        lessonId: currentLesson._id,
        sectionId: currentSection._id,
        watchTime: Math.floor(currentTime),
      });
    }
  };

  const handleAddNote = () => {
    if (noteText.trim() && currentLesson) {
      addNoteMutation.mutate({
        lessonId: currentLesson._id,
        content: noteText.trim(),
        timestamp: Math.floor(currentTime),
      });
    }
  };

  const handleAddBookmark = () => {
    if (currentLesson) {
      addBookmarkMutation.mutate({
        lessonId: currentLesson._id,
        timestamp: Math.floor(currentTime),
        title: `${currentLesson.title} - ${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`,
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousLesson();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextLesson();
          break;
        case 'b':
          e.preventDefault();
          handleAddBookmark();
          break;
        case 'n':
          e.preventDefault();
          setShowNotes(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentLesson]);

  if (courseLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size="lg" color="white" text="Loading course..." />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/my-courses')}
            className="btn-primary"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  const isLessonCompleted = progress?.completedLessons?.includes(currentLesson._id);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ duration: 0.3 }}
            className="w-96 bg-secondary-900 border-r border-secondary-700 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-secondary-700">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate('/my-courses')}
                  className="text-secondary-400 hover:text-white transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-secondary-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <h2 className="font-semibold text-white line-clamp-2">
                {course.title}
              </h2>
              <div className="text-sm text-secondary-400 mt-1">
                {progress?.completedLessons?.length || 0} of {course.totalLessons || 0} lessons completed
              </div>
              <div className="progress mt-2">
                <div 
                  className="progress-bar bg-primary-500" 
                  style={{ 
                    width: `${((progress?.completedLessons?.length || 0) / (course.totalLessons || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Course Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {course.sections?.map((section) => (
                <div key={section._id} className="border-b border-secondary-700">
                  <div className="p-4">
                    <h3 className="font-medium text-white mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.lessons?.map((lesson) => (
                        <button
                          key={lesson._id}
                          onClick={() => navigate(`/learn/${courseId}/${section._id}/${lesson._id}`)}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                            lesson._id === currentLesson._id
                              ? 'bg-primary-600 text-white'
                              : 'text-secondary-300 hover:bg-secondary-800'
                          }`}
                        >
                          <div className="flex items-center mr-3">
                            {progress?.completedLessons?.includes(lesson._id) ? (
                              <CheckIcon className="w-4 h-4 text-green-400" />
                            ) : (
                              <PlayIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium line-clamp-1">
                              {lesson.title}
                            </div>
                            <div className="text-xs opacity-75">
                              {lesson.duration || 0} min
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="flex-1 relative bg-black">
          {currentLesson.videoUrl ? (
            <ReactPlayer
              url={currentLesson.videoUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              playbackRate={playbackRate}
              onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
              onDuration={setDuration}
              onEnded={handleLessonComplete}
              controls={false}
              config={{
                file: {
                  attributes: {
                    crossOrigin: 'anonymous',
                  },
                  tracks: currentLesson.captions ? [
                    {
                      kind: 'subtitles',
                      src: currentLesson.captions,
                      srcLang: 'en',
                      default: true,
                    },
                  ] : [],
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <PlayIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No video available</h3>
                <p className="text-secondary-400">
                  This lesson doesn't have a video yet.
                </p>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6 ml-1" />
                )}
              </button>

              {/* Progress Bar */}
              <div className="flex-1">
                <div className="progress bg-white/20">
                  <div 
                    className="progress-bar bg-primary-500" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                  </span>
                  <span>
                    {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddBookmark}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  title="Add Bookmark (B)"
                >
                  <BookmarkIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowNotes(true)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  title="Add Note (N)"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                </button>

                <select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sidebar Toggle */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-secondary-900 border-t border-secondary-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                {currentLesson.title}
              </h3>
              <p className="text-sm text-secondary-400">
                {currentSection.title}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousLesson}
                className="btn-outline btn-sm flex items-center"
                disabled={!course.sections?.[0]?.lessons?.[0] || 
                         currentLesson._id === course.sections[0].lessons[0]._id}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>

              {!isLessonCompleted && (
                <button
                  onClick={handleLessonComplete}
                  disabled={completeLessonMutation.isLoading}
                  className="btn-success btn-sm flex items-center"
                >
                  {completeLessonMutation.isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Mark Complete
                    </>
                  )}
                </button>
              )}

              <button
                onClick={goToNextLesson}
                className="btn-primary btn-sm flex items-center"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowNotes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Add Note
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note here..."
                className="input w-full h-32 resize-none mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNotes(false)}
                  className="btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || addNoteMutation.isLoading}
                  className="btn-primary btn-sm"
                >
                  {addNoteMutation.isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Add Note'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayerPage;
