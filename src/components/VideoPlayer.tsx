import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface Video {
  _id: string;
  title: string;
  link: string;
  duration: number;
  type: string;
}

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface QualityLevel {
  height: number;
  width: number;
  bitrate: number;
  index: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const doubleTapIndicatorRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showDoubleTapIndicator, setShowDoubleTapIndicator] = useState<'left' | 'right' | null>(null);

  const getProgressKey = (videoId: string) => `sigma6_progress_${videoId}`;

  const saveProgress = useCallback(() => {
    if (videoRef.current && video._id) {
      const progress = {
        time: videoRef.current.currentTime,
        duration: videoRef.current.duration,
        timestamp: Date.now()
      };
      localStorage.setItem(getProgressKey(video._id), JSON.stringify(progress));
    }
  }, [video._id]);

  const loadProgress = useCallback(() => {
    const saved = localStorage.getItem(getProgressKey(video._id));
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        if (Date.now() - progress.timestamp < 30 * 24 * 60 * 60 * 1000) {
          return progress.time;
        }
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
    return 0;
  }, [video._id]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    setIsLoading(true);
    setQualityLevels([]);
    setCurrentQuality(-1);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(video.link);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          index,
        }));
        setQualityLevels(levels.sort((a, b) => b.height - a.height));
        
        const savedTime = loadProgress();
        if (savedTime > 0 && savedTime < (videoElement.duration || video.duration) - 5) {
          videoElement.currentTime = savedTime;
        }
        
        videoElement.play().catch(console.error);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS Error:', data);
          setIsLoading(false);
        }
      });

      return () => {
        saveProgress();
        hls.destroy();
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = video.link;
      const savedTime = loadProgress();
      if (savedTime > 0) {
        videoElement.currentTime = savedTime;
      }
      videoElement.play().catch(console.error);
      
      return () => {
        saveProgress();
      };
    }
  }, [video.link, video._id, loadProgress, saveProgress, video.duration]);

  useEffect(() => {
    progressSaveIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 5000);

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
      saveProgress();
    };
  }, [saveProgress]);

  useEffect(() => {
    const userId = localStorage.getItem('sigma6_user_id');
    if (userId) {
      const logs = JSON.parse(localStorage.getItem('sigma6_admin_logs') || '[]');
      logs.push({
        type: 'video_start',
        userId,
        videoId: video._id,
        videoTitle: video.title,
        timestamp: Date.now()
      });
      localStorage.setItem('sigma6_admin_logs', JSON.stringify(logs));
    }
  }, [video._id, video.title]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleDurationChange = () => setDuration(videoElement.duration);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      localStorage.removeItem(getProgressKey(video._id));
      if (hasNext && onNext) {
        onNext();
      }
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [hasNext, onNext, video._id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const hideControls = useCallback(() => {
    setShowControls(false);
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
  }, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
    }
  }, [isPlaying, hideControls]);

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
    }
  }, [isPlaying, resetControlsTimeout]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;
    const now = Date.now();

    // Check for double tap
    if (now - lastTapRef.current.time < 300) {
      const lastX = lastTapRef.current.x;
      
      // Double tap on right side (last 40%) - forward 10 seconds
      if (x > width * 0.6 && lastX > width * 0.6) {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
          setShowDoubleTapIndicator('right');
          if (doubleTapIndicatorRef.current) clearTimeout(doubleTapIndicatorRef.current);
          doubleTapIndicatorRef.current = setTimeout(() => setShowDoubleTapIndicator(null), 500);
        }
        lastTapRef.current = { time: 0, x: 0 };
        resetControlsTimeout();
        return;
      }
      
      // Double tap on left side (first 40%) - rewind 10 seconds
      if (x < width * 0.4 && lastX < width * 0.4) {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
          setShowDoubleTapIndicator('left');
          if (doubleTapIndicatorRef.current) clearTimeout(doubleTapIndicatorRef.current);
          doubleTapIndicatorRef.current = setTimeout(() => setShowDoubleTapIndicator(null), 500);
        }
        lastTapRef.current = { time: 0, x: 0 };
        resetControlsTimeout();
        return;
      }
    }

    lastTapRef.current = { time: now, x };

    // Single tap in center zone (middle 20%) - toggle play/pause
    const centerStart = width * 0.4;
    const centerEnd = width * 0.6;
    
    if (x >= centerStart && x <= centerEnd) {
      togglePlay();
    }

    // Any tap shows/hides controls
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowQualityMenu(false);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getQualityLabel = (level: QualityLevel) => {
    return `${level.height}p`;
  };

  const handleClose = () => {
    saveProgress();
    onClose();
  };

  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header - slides from top */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 transition-all duration-300 ease-out ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        onClick={handleControlsClick}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-lg font-medium truncate">{video.title}</h2>
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold text-sm hidden sm:block">
            @Invisiblebots
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div
        className="flex-1 relative flex items-center justify-center bg-black"
        onMouseMove={resetControlsTimeout}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={(e) => e.preventDefault()}
        />

        {/* Click/Touch Area Overlay */}
        <div
          className="absolute inset-0"
          onClick={handleVideoAreaClick}
          onTouchEnd={handleVideoAreaClick}
        >
          {/* Left zone for double-tap rewind */}
          <div className="absolute left-0 top-0 w-[40%] h-full flex items-center justify-center">
            {showDoubleTapIndicator === 'left' && (
              <div className="bg-white/20 rounded-full p-6 animate-ping">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
                <span className="text-white text-sm font-medium block text-center mt-1">-10s</span>
              </div>
            )}
          </div>

          {/* Center zone for play/pause */}
          <div className="absolute left-[40%] top-0 w-[20%] h-full flex items-center justify-center">
            {/* Center play button when paused */}
            {!isPlaying && !isLoading && (
              <div className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer">
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Right zone for double-tap forward */}
          <div className="absolute right-0 top-0 w-[40%] h-full flex items-center justify-center">
            {showDoubleTapIndicator === 'right' && (
              <div className="bg-white/20 rounded-full p-6 animate-ping">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
                <span className="text-white text-sm font-medium block text-center mt-1">+10s</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Controls - slides from bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 ease-out ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        onClick={handleControlsClick}
      >
        {/* Progress Bar */}
        <div className="px-4 pt-8 pb-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`,
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="px-4 pb-6 flex items-center gap-2 sm:gap-4">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            {isPlaying ? (
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Previous */}
          {hasPrevious && (
            <button onClick={onPrevious} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
          )}

          {/* Skip Back */}
          <button onClick={() => skip(-10)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Skip Forward */}
          <button onClick={() => skip(10)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Next */}
          {hasNext && (
            <button onClick={onNext} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          )}

          {/* Time */}
          <span className="text-white text-sm whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Quality */}
          {qualityLevels.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className="px-2 py-1 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white text-xs hidden sm:inline">
                  {currentQuality === -1 ? 'Auto' : `${qualityLevels.find(q => q.index === currentQuality)?.height || 'Auto'}p`}
                </span>
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center justify-between ${
                      currentQuality === -1 ? 'text-purple-400' : 'text-white'
                    }`}
                  >
                    Auto
                    {currentQuality === -1 && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </button>
                  {qualityLevels.map((level) => (
                    <button
                      key={level.index}
                      onClick={() => handleQualityChange(level.index)}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center justify-between ${
                        currentQuality === level.index ? 'text-purple-400' : 'text-white'
                      }`}
                    >
                      {getQualityLabel(level)}
                      {currentQuality === level.index && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowQualityMenu(false);
              }}
              className="px-2 py-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span className="text-white text-sm font-medium">{playbackRate}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 ${
                      playbackRate === rate ? 'text-purple-400' : 'text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            {isFullscreen ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
