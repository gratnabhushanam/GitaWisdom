import React, { useEffect, useRef, useState } from 'react';
import { getYoutubeEmbedUrl, getYoutubeVideoId, isYoutubeUrl } from '../utils/media';
import Hls from 'hls.js';

// Helper to extract videoId from HLS or CDN URL
function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/videos\/(\w+)/);
  if (match) return match[1];
  try {
    const params = new URL(url, window.location.origin).searchParams;
    return params.get('videoId');
  } catch {
    return null;
  }
}

export default function MediaPlayer({
  url,
  hlsUrl,
  title,
  className = '',
  youtubeParams = '',
  autoPlay = false,
  shouldPlay,
  muted = false,
  loop = false,
  controls = true,
  playsInline = true,
  onEnded,
  instagramMode = false,
  playLimitSeconds = null,
  preload = "metadata",
}) {
  const [showTools, setShowTools] = useState(false);
  const [secureHlsUrl, setSecureHlsUrl] = useState('');
  const [secureVideoUrl, setSecureVideoUrl] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [hlsFallbackActive, setHlsFallbackActive] = useState(false);

  const getAbsoluteUrl = (inputUrl) => {
    if (!inputUrl) return inputUrl;
    if (inputUrl.startsWith('/uploads/') || inputUrl.startsWith('/api/')) {
      const isProd = import.meta.env.MODE === 'production';
      const baseUrl = isProd ? 'https://gitawisdom.onrender.com' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888');
      return `${baseUrl}${inputUrl}`;
    }
    return inputUrl;
  };

  const cdnHlsUrl = getAbsoluteUrl(hlsUrl || '');
  const cdnVideoUrl = getAbsoluteUrl(url || '');
  const effectiveShouldPlay = typeof shouldPlay === 'boolean' ? shouldPlay : autoPlay;

  // Fetch secure HLS token
  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      if (!cdnHlsUrl && !cdnVideoUrl) return;
      
      const isLocalUrl = (u) => u && (u.includes('/uploads/') || u.includes('/api/'));
      const needsToken = isLocalUrl(cdnHlsUrl) || isLocalUrl(cdnVideoUrl);
      
      if (!needsToken) {
        if (!cancelled) {
          setSecureHlsUrl(cdnHlsUrl);
          setSecureVideoUrl(cdnVideoUrl);
          setLoadingToken(false);
        }
        return;
      }
      
      setLoadingToken(true);
      try {
        const videoId = extractVideoId(cdnHlsUrl) || extractVideoId(cdnVideoUrl) || 'anonymous';
        const absoluteTokenUrl = getAbsoluteUrl(`/api/videos/hls-token?videoId=${videoId}`);
        const res = await fetch(absoluteTokenUrl);
        if (!res.ok) throw new Error('token endpoint unavailable');
        const data = await res.json();
        if (!data?.token) throw new Error('no token');
        
        if (cdnHlsUrl && isLocalUrl(cdnHlsUrl)) {
          const hlsUrlObj = new URL(cdnHlsUrl, window.location.origin);
          hlsUrlObj.searchParams.set('token', data.token);
          if (!cancelled) setSecureHlsUrl(hlsUrlObj.toString());
        } else {
          if (!cancelled) setSecureHlsUrl(cdnHlsUrl);
        }
        
        if (cdnVideoUrl && !isYoutubeUrl(cdnVideoUrl) && isLocalUrl(cdnVideoUrl)) {
          const videoUrlObj = new URL(cdnVideoUrl, window.location.origin);
          videoUrlObj.searchParams.set('token', data.token);
          if (!cancelled) setSecureVideoUrl(videoUrlObj.toString());
        } else {
          if (!cancelled) setSecureVideoUrl(cdnVideoUrl);
        }
      } catch {
        if (!cancelled) {
          setSecureHlsUrl(cdnHlsUrl);
          setSecureVideoUrl(cdnVideoUrl);
        }
      } finally {
        if (!cancelled) setLoadingToken(false);
      }
    }
    fetchToken();
    return () => { cancelled = true; };
  }, [cdnHlsUrl, cdnVideoUrl]);

  // HLS playback hook — handle source changes without re-mounting
  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadingToken) return;

    const sourceToUse = hlsFallbackActive ? (secureVideoUrl || cdnVideoUrl) : (secureHlsUrl || secureVideoUrl || cdnVideoUrl);
    if (!sourceToUse) return;

    let hlsInstance = null;

    if (sourceToUse.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceToUse;
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(sourceToUse);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
             setHlsFallbackActive(true);
          }
        });
      } else {
        video.src = sourceToUse;
      }
    } else {
      video.src = sourceToUse;
    }

    return () => {
      if (hlsInstance) hlsInstance.destroy();
    };
  }, [secureHlsUrl, secureVideoUrl, loadingToken, hlsFallbackActive, cdnVideoUrl]);

  const activeSource = hlsFallbackActive ? null : secureHlsUrl;
  const resolvedUrl = secureVideoUrl || cdnVideoUrl;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => {
      const current = video.currentTime || 0;
      setProgress(current);
      if (playLimitSeconds && current >= playLimitSeconds) video.pause();
    };
    const updateDuration = () => setDuration(video.duration || 0);

    const handleFullscreenChange = async () => {
      const inFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(inFullscreen);
      if (inFullscreen && window.screen?.orientation?.lock) {
        try { await window.screen.orientation.lock('landscape'); } catch {
          try { await window.screen.orientation.lock('landscape-primary'); } catch {}
        }
      } else if (!inFullscreen && window.screen?.orientation?.unlock) {
        try { window.screen.orientation.unlock(); } catch {}
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('loadedmetadata', updateDuration);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    video.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
    video.addEventListener('webkitendfullscreen', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('loadedmetadata', updateDuration);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      video.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
      video.removeEventListener('webkitendfullscreen', handleFullscreenChange);
    };
  }, [secureHlsUrl, resolvedUrl, loadingToken, playLimitSeconds]);

  useEffect(() => {
    if (effectiveShouldPlay && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
             playPromise.catch(e => {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(() => {});
             });
        }
    } else if (!effectiveShouldPlay && videoRef.current) {
        videoRef.current.pause();
    }
  }, [effectiveShouldPlay, loadingToken]);

  if (!cdnVideoUrl && !cdnHlsUrl) return null;

  const toggleFullscreen = async () => {
    const target = containerRef.current || videoRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (target.requestFullscreen) await target.requestFullscreen();
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        else if (videoRef.current?.webkitEnterFullscreen) videoRef.current.webkitEnterFullscreen();
      }
    } catch {}
  };

  if (isYoutubeUrl(secureVideoUrl || cdnVideoUrl)) {
    const embedUrl = getYoutubeEmbedUrl(secureVideoUrl || cdnVideoUrl);
    const videoId = getYoutubeVideoId(cdnVideoUrl);
    const params = new URLSearchParams(youtubeParams);
    if (loop && videoId && !params.has('playlist')) params.set('playlist', videoId);
    const src = params.toString() ? `${embedUrl}?${params.toString()}` : embedUrl;
    return (
      <div ref={containerRef} className={`relative group overflow-hidden bg-black ${className}`}>
        <iframe
          className="w-full h-full absolute inset-0"
          src={src}
          title={title || 'YouTube player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setProgress(newTime);
    }
  };

  if (loadingToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/70 text-devotion-gold text-[10px] font-black uppercase tracking-widest text-center px-4`}>
        Connecting...
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative group overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        className={`w-full ${instagramMode ? 'h-[100dvh] object-cover rounded-none' : 'h-full aspect-video object-contain bg-black rounded-xl'} shadow-lg`}
        crossOrigin="anonymous"
        muted={muted}
        loop={loop}
        controls={instagramMode ? false : controls}
        playsInline={playsInline}
        preload={preload}
        onEnded={onEnded}
        title={title}
      />
      {instagramMode && duration > 0 && (
         <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-[60] hover:h-4 transition-all cursor-pointer">
           <div 
             className="absolute top-0 left-0 bottom-0 bg-[#E6C38A] shadow-[0_0_10px_rgba(230,195,138,0.8)]" 
             style={{ width: `${(progress / duration) * 100}%` }}
           ></div>
           <input 
             type="range"
             min={0}
             max={duration}
             step="0.01"
             value={progress}
             onChange={handleSeek}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
           />
         </div>
      )}
      {!instagramMode && (
         <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 hover:bg-devotion-gold/20 opacity-0 group-hover:opacity-100 transition-all active:scale-95 shadow-xl"
            title="Fullscreen"
         >
            ⤢
         </button>
      )}
    </div>
  );
}
