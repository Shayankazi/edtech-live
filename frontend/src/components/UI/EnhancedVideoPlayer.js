import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaClosedCaptioning,
  FaStickyNote,
  FaDownload,
  FaShare,
  FaBookmark,
  FaCog,
  FaForward,
  FaBackward
} from 'react-icons/fa';
import { MdSpeed, MdPictureInPicture, MdHighQuality } from 'react-icons/md';

const EnhancedVideoPlayer = ({
  src,
  captions,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  onNoteCreate,
  showNotesPanel = true
}) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  const controlsTimeout = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBuffered();
      
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
      
      // Update captions
      if (captions && showCaptions) {
        const caption = captions.find(
          cap => video.currentTime >= cap.start && video.currentTime <= cap.end
        );
        setCurrentCaption(caption ? caption.text : '');
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPause) onPause();
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [captions, showCaptions, onTimeUpdate, onPlay, onPause]);

  const updateBuffered = () => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / video.duration) * 100;
      setBuffered(bufferedPercent);
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    if (onSeek) onSeek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.parentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const changeQuality = (newQuality) => {
    setQuality(newQuality);
    setShowQualityMenu(false);
    // In production, this would reload the video with different quality
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), duration);
  };

  const addBookmark = () => {
    const newBookmark = {
      time: currentTime,
      label: `Bookmark at ${formatTime(currentTime)}`
    };
    setBookmarks([...bookmarks, newBookmark]);
    setShowBookmarkTooltip(true);
    setTimeout(() => setShowBookmarkTooltip(false), 2000);
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captions */}
      <AnimatePresence>
        {showCaptions && currentCaption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg max-w-3xl text-center backdrop-blur-sm"
          >
            <p className="text-lg leading-relaxed">{currentCaption}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmark Tooltip */}
      <AnimatePresence>
        {showBookmarkTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Bookmark added!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                ref={progressRef}
                className="relative h-1 bg-gray-600 rounded-full cursor-pointer group/progress"
                onClick={handleSeek}
              >
                {/* Buffered */}
                <div 
                  className="absolute h-full bg-gray-500 rounded-full"
                  style={{ width: `${buffered}%` }}
                />
                
                {/* Progress */}
                <div 
                  className="absolute h-full bg-primary-500 rounded-full group-hover/progress:h-2 transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>

                {/* Bookmarks */}
                {bookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                    style={{ left: `${(bookmark.time / duration) * 100}%` }}
                    title={bookmark.label}
                  />
                ))}
              </div>
              
              {/* Time Display */}
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>

                {/* Skip Buttons */}
                <button
                  onClick={() => skip(-10)}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  <FaBackward size={16} />
                </button>
                <button
                  onClick={() => skip(10)}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  <FaForward size={16} />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2 group/volume">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-primary-500"
                  />
                </div>

                {/* Current Time */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-4">
                {/* Bookmark */}
                <button
                  onClick={addBookmark}
                  className="text-white hover:text-yellow-400 transition-colors"
                  title="Add bookmark"
                >
                  <FaBookmark size={18} />
                </button>

                {/* Notes */}
                {showNotesPanel && (
                  <button
                    onClick={() => onNoteCreate && onNoteCreate(currentTime)}
                    className="text-white hover:text-primary-400 transition-colors"
                    title="Add note"
                  >
                    <FaStickyNote size={18} />
                  </button>
                )}

                {/* Captions */}
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`transition-colors ${showCaptions ? 'text-primary-400' : 'text-white hover:text-primary-400'}`}
                  title="Toggle captions"
                >
                  <FaClosedCaptioning size={20} />
                </button>

                {/* Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="text-white hover:text-primary-400 transition-colors"
                    title="Playback speed"
                  >
                    <MdSpeed size={22} />
                  </button>
                  
                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                      >
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => changeSpeed(speed)}
                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                              playbackSpeed === speed ? 'text-primary-400' : 'text-white'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quality */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-primary-400 transition-colors"
                    title="Video quality"
                  >
                    <MdHighQuality size={22} />
                  </button>
                  
                  <AnimatePresence>
                    {showQualityMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                      >
                        {['1080p', '720p', '480p', '360p', 'Auto'].map(q => (
                          <button
                            key={q}
                            onClick={() => changeQuality(q)}
                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                              quality === q ? 'text-primary-400' : 'text-white'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Picture in Picture */}
                <button
                  onClick={togglePictureInPicture}
                  className="text-white hover:text-primary-400 transition-colors"
                  title="Picture in Picture"
                >
                  <MdPictureInPicture size={22} />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-primary-400 transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedVideoPlayer;
