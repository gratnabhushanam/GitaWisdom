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

// Dynamically load hls.js only if needed
let Hls = null;
if (typeof window !== 'undefined') {
  try {
    Hls = require('hls.js');
  } catch {}
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
  fallbackLabel = 'Open video in a new tab',
  onEnded,
  instagramMode = false,
}) {
  const [failed, setFailed] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [secureHlsUrl, setSecureHlsUrl] = useState('');
  const [secureVideoUrl, setSecureVideoUrl] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

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

  // Fetch secure HLS token — falls back gracefully if endpoint is missing
  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      if (!cdnHlsUrl && !cdnVideoUrl) return;
      setLoadingToken(true);
      try {
        const videoId = extractVideoId(cdnHlsUrl) || extractVideoId(cdnVideoUrl) || 'anonymous';
        const absoluteTokenUrl = getAbsoluteUrl(`/api/videos/hls-token?videoId=${videoId}`);
        const res = await fetch(absoluteTokenUrl);
        if (!res.ok) throw new Error('token endpoint unavailable');
        const data = await res.json();
        if (!data?.token) throw new Error('no token');
        
        if (cdnHlsUrl) {
          const hlsUrlObj = new URL(cdnHlsUrl, window.location.origin);
          hlsUrlObj.searchParams.set('token', data.token);
          if (!cancelled) setSecureHlsUrl(hlsUrlObj.toString());
        }
        
        if (cdnVideoUrl && !isYoutubeUrl(cdnVideoUrl) && cdnVideoUrl.includes('/uploads/')) {
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

  if (!cdnVideoUrl && !cdnHlsUrl) return null;

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
      <iframe
        className={className}
        src={src}
        title={title || 'YouTube player'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  const hlsSource = secureHlsUrl;
  const resolvedUrl = secureVideoUrl || cdnVideoUrl;

  const [failed, setFailed] = useState(false);
  const [hlsFallbackActive, setHlsFallbackActive] = useState(false);

  // HLS playback hook
  useEffect(() => {
    if (!hlsSource || loadingToken || hlsFallbackActive) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Browser native HLS
      video.src = hlsSource;
      video.onerror = () => setHlsFallbackActive(true);
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsSource);
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
  }, [hlsSource, loadingToken, hlsFallbackActive]);

  const activeSource = hlsFallbackActive ? null : hlsSource;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => setProgress(video.currentTime || 0);
    const updateDuration = () => setDuration(video.duration || 0);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('loadedmetadata', updateDuration);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [hlsSource, resolvedUrl, loadingToken]);

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
      {hlsSource && (
        <button className="text-xs text-devotion-gold hover:underline" onClick={() => navigator.clipboard.writeText(hlsSource)}>
          Copy HLS Link
        </button>
      )}
      {resolvedUrl && (
        <button className="text-xs text-devotion-gold hover:underline" onClick={() => navigator.clipboard.writeText(resolvedUrl)}>
          Copy CDN Link
        </button>
      )}
      {hlsSource && <a href={hlsSource} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Open HLS in Tab</a>}
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
    <div className={`relative group overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className={`w-full ${instagramMode ? 'h-[100dvh] object-cover rounded-none' : 'h-auto rounded-xl'} shadow-lg`}
        src={activeSource || resolvedUrl}
        autoPlay={effectiveShouldPlay}
        muted={muted}
        loop={loop}
        controls={instagramMode ? false : controls}
        playsInline={playsInline}
        onError={() => setFailed(true)}
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
      {(hlsSource || resolvedUrl) && !instagramMode && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-devotion-gold text-xs px-3 py-1 rounded-full font-bold shadow-lg">
          {hlsSource ? 'HLS / CDN' : 'CDN'}
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
