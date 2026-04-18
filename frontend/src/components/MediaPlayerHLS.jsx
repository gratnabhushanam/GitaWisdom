import React, { useEffect, useRef, useState } from 'react';
import { getYoutubeEmbedUrl, getYoutubeVideoId, isYoutubeUrl } from '../utils/media';

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

import Hls from 'hls.js';

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

  // Fetch secure HLS token — only for local /uploads/ URLs, skip for external URLs
  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      if (!cdnHlsUrl && !cdnVideoUrl) return;
      
      // External URLs (Cloudinary, YouTube, Google Drive, etc.) don't need tokens
      const isLocalUrl = (u) => u && (u.includes('/uploads/') || u.includes('/api/'));
      const needsToken = isLocalUrl(cdnHlsUrl) || isLocalUrl(cdnVideoUrl);
      
      if (!needsToken) {
        // External MP4 — set URLs directly, no token needed
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

  // HLS playback hook
  useEffect(() => {
    if (!secureHlsUrl || loadingToken || hlsFallbackActive) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = secureHlsUrl;
      video.onerror = () => setHlsFallbackActive(true);
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(secureHlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          hls.destroy();
          setHlsFallbackActive(true);
        }
      });
      return () => hls.destroy();
    } else {
      setHlsFallbackActive(true);
    }
  }, [secureHlsUrl, loadingToken, hlsFallbackActive]);

  const activeSource = hlsFallbackActive ? null : secureHlsUrl;
  const resolvedUrl = secureVideoUrl || cdnVideoUrl;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => {
      const current = video.currentTime || 0;
      setProgress(current);
      
      // Feature: Auto Teaser Limit (2 Minutes cutoff)
      if (playLimitSeconds && current >= playLimitSeconds) {
        video.pause();
      }
    };
    const updateDuration = () => setDuration(video.duration || 0);

    // Feature: Auto Rotate Fullscreen (Mobile)
    const handleFullscreenChange = async () => {
      const inFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(inFullscreen);
      
      if (inFullscreen) {
        // Entering fullscreen — lock to landscape
        if (window.screen?.orientation?.lock) {
          try {
            await window.screen.orientation.lock('landscape');
          } catch (e) {
            try {
              await window.screen.orientation.lock('landscape-primary');
            } catch (e2) {
              console.warn('Orientation lock not supported on this device.', e2);
            }
          }
        }
      } else {
        // Exiting fullscreen — unlock orientation
        if (window.screen?.orientation?.unlock) {
          try { window.screen.orientation.unlock(); } catch (e) {}
        }
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('loadedmetadata', updateDuration);
    
    // Bind native Fullscreen state listeners globally for iOS/Android
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    if (video) {
        video.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
        video.addEventListener('webkitendfullscreen', handleFullscreenChange);
    }

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('loadedmetadata', updateDuration);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (video) {
          video.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
          video.removeEventListener('webkitendfullscreen', handleFullscreenChange);
      }
    };
  }, [secureHlsUrl, resolvedUrl, loadingToken, playLimitSeconds]);

  useEffect(() => {
    if (effectiveShouldPlay && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
             playPromise.catch(e => {
                  console.warn("Autoplay blocked, attempting muted play:", e);
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(err => console.warn("Fallback play also blocked:", err));
             });
        }
    } else if (!effectiveShouldPlay && videoRef.current) {
        videoRef.current.pause();
    }
  }, [effectiveShouldPlay, activeSource, resolvedUrl, loadingToken]);

  if (!cdnVideoUrl && !cdnHlsUrl) return null;

  // Fullscreen + Rotate toggle for mobile
  const toggleFullscreen = async () => {
    const target = containerRef.current || videoRef.current;
    if (!target) return;
    
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        // Exit fullscreen
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        // Enter fullscreen
        if (target.requestFullscreen) await target.requestFullscreen();
        else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
        else if (videoRef.current?.webkitEnterFullscreen) videoRef.current.webkitEnterFullscreen(); // iOS Safari
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed:', e);
    }
  };

  // YouTube embed
  if (isYoutubeUrl(secureVideoUrl || cdnVideoUrl)) {
    const embedUrl = getYoutubeEmbedUrl(secureVideoUrl || cdnVideoUrl);
    const videoId = getYoutubeVideoId(cdnVideoUrl);
    const params = new URLSearchParams(youtubeParams);
    if (loop && videoId && !params.has('playlist')) {
      params.set('playlist', videoId);
    }
    const queryString = params.toString();
    const src = queryString ? `${embedUrl}?${queryString}` : embedUrl;
    return (
      <div ref={containerRef} className={`relative group overflow-hidden ${className}`}>
        <iframe
          className="w-full h-full absolute inset-0"
          src={src}
          title={title || 'YouTube player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {!instagramMode && (
          <div className="absolute bottom-2 right-12 flex items-center gap-2 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleFullscreen}
              className="bg-black/70 text-white hover:text-devotion-gold text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 transition-colors border border-white/20 hover:border-devotion-gold/50 pointer-events-auto"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen & Rotate'}
            >
              {isFullscreen ? '✕' : '⤢'} {isFullscreen ? 'Exit' : 'Rotate'}
            </button>
            <div className="bg-[#ff0000]/80 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg pointer-events-auto">
              YouTube
            </div>
          </div>
        )}
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

  // Advanced tools panel
  const AdvancedTools = () => (
    <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 bg-black/80 rounded-xl p-2 border border-devotion-gold/30 shadow-xl">
      {secureHlsUrl && (
        <button className="text-xs text-devotion-gold hover:underline" onClick={() => navigator.clipboard.writeText(secureHlsUrl)}>
          Copy HLS Link
        </button>
      )}
      {resolvedUrl && (
        <button className="text-xs text-devotion-gold hover:underline" onClick={() => navigator.clipboard.writeText(resolvedUrl)}>
          Copy CDN Link
        </button>
      )}
      {secureHlsUrl && <a href={secureHlsUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Open HLS in Tab</a>}
      {resolvedUrl && <a href={resolvedUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Open CDN in Tab</a>}
      {resolvedUrl && <a href={resolvedUrl} download className="text-xs text-green-400 hover:underline">Download Original</a>}
    </div>
  );

  if (loadingToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/70 text-devotion-gold text-center px-4`}>
        Loading secure playback...
      </div>
    );
  }

  // Empty failed array so we never rip the video out of the layout

  return (
    <div ref={containerRef} className={`relative group overflow-hidden ${className}`}>
      <video
        key={hlsFallbackActive ? 'fallback' : 'hls'}
        ref={videoRef}
        className={`w-full ${instagramMode ? 'h-[100dvh] object-cover rounded-none' : 'h-full aspect-video object-contain bg-black rounded-xl'} shadow-lg`}
        src={activeSource || resolvedUrl}
        crossOrigin="anonymous"
        autoPlay={effectiveShouldPlay}
        muted={muted}
        loop={loop}
        controls={instagramMode ? false : controls}
        playsInline={playsInline}
        preload="metadata"
        onError={() => {
          console.warn('Video failed to play, trying fallback');
          if (!hlsFallbackActive && secureHlsUrl) {
            setHlsFallbackActive(true);
          }
        }}
        onEnded={onEnded}
        title={title}
      />
      <button
        onClick={() => setShowTools(v => !v)}
        className="absolute top-2 left-2 bg-devotion-gold/20 text-devotion-gold rounded-full px-2 py-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition"
        title="More tools"
      >
        ⋮
      </button>
      {showTools && <AdvancedTools />}
      {(secureHlsUrl || resolvedUrl) && !instagramMode && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="bg-black/70 text-white hover:text-devotion-gold text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 transition-colors border border-white/20 hover:border-devotion-gold/50"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen & Rotate'}
          >
            {isFullscreen ? '✕' : '⤢'} {isFullscreen ? 'Exit' : 'Rotate'}
          </button>
          <div className="bg-black/70 text-devotion-gold text-xs px-3 py-1 rounded-full font-bold shadow-lg">
            {secureHlsUrl ? 'HLS / CDN' : 'CDN'}
          </div>
        </div>
      )}
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
    </div>
  );
}
