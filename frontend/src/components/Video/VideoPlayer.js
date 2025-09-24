import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { getVideoUrl } from '../../config/api';

const VideoPlayer = ({ 
  src, 
  captions = null,
  showCaptions = false,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  onCaptionToggle,
  onInteraction
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        const time = video.currentTime;
        setCurrentTime(time);
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
        
        // Update captions based on current time
        if (captions && showCaptions) {
          const currentCap = captions.find(cap => 
            time >= cap.start && time <= cap.end
          );
          setCurrentCaption(currentCap ? currentCap.text : '');
        }
      };
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        if (onPlay) {
          onPlay();
        }
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        if (onPause) {
          onPause();
        }
      };
      
      const handleVolumeChange = () => {
        if (onVolumeChange) {
          onVolumeChange(video.volume);
        }
      };
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('volumechange', handleVolumeChange);
      
      return () => {
        if (video) {
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('volumechange', handleVolumeChange);
        }
      };
    }
  }, [captions, showCaptions, onTimeUpdate, onPlay, onPause, onVolumeChange]);

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Video play error:', error);
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      if (onSeek) {
        onSeek(newTime);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
    
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (isMuted) {
        video.volume = volume;
        setIsMuted(false);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
      
      if (onVolumeChange) {
        onVolumeChange(video.volume);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (document.fullscreenElement) {
        document.exitFullscreen();
        if (onFullscreen) onFullscreen(false);
      } else {
        video.requestFullscreen();
        if (onFullscreen) onFullscreen(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Captions */}
      {showCaptions && currentCaption && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded text-center max-w-3xl">
          {currentCaption}
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary-400 transition-colors"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onCaptionToggle && (
              <button
                onClick={() => {
                  onCaptionToggle(!showCaptions);
                  onInteraction?.({ type: 'caption_toggle', timestamp: currentTime });
                }}
                className={`text-white hover:text-primary-400 transition-colors ${showCaptions ? 'text-primary-400' : ''}`}
              >
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
              </button>
            )}

            <button className="text-white hover:text-primary-400 transition-colors">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary-400 transition-colors"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
