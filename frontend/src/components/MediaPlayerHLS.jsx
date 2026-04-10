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
}) {
  const [failed, setFailed] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [secureHlsUrl, setSecureHlsUrl] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const videoRef = useRef(null);

  const cdnHlsUrl = hlsUrl || '';
  const cdnVideoUrl = url || '';
  const effectiveShouldPlay = typeof shouldPlay === 'boolean' ? shouldPlay : autoPlay;

  // Fetch secure HLS token — falls back gracefully if endpoint is missing
  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      if (!cdnHlsUrl) return;
      setLoadingToken(true);
      try {
        const videoId = extractVideoId(cdnHlsUrl) || extractVideoId(cdnVideoUrl);
        if (!videoId) {
          if (!cancelled) setSecureHlsUrl(cdnHlsUrl);
          return;
        }
        const res = await fetch(`/api/videos/hls-token?videoId=${videoId}`);
        if (!res.ok) throw new Error('token endpoint unavailable');
        const data = await res.json();
        if (!data?.token) throw new Error('no token');
        const urlObj = new URL(cdnHlsUrl, window.location.origin);
        urlObj.searchParams.set('token', data.token);
        if (!cancelled) setSecureHlsUrl(urlObj.toString());
      } catch {
        if (!cancelled) setSecureHlsUrl(cdnHlsUrl);
      } finally {
        if (!cancelled) setLoadingToken(false);
      }
    }
    if (cdnHlsUrl) {
      fetchToken();
    } else {
      setSecureHlsUrl('');
    }
    return () => { cancelled = true; };
  }, [cdnHlsUrl, cdnVideoUrl]);

  if (!cdnVideoUrl && !cdnHlsUrl) return null;

  // YouTube embed
  if (isYoutubeUrl(cdnVideoUrl)) {
    const embedUrl = getYoutubeEmbedUrl(cdnVideoUrl);
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
  const resolvedUrl = cdnVideoUrl;

  // HLS playback hook
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!hlsSource || loadingToken) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSource;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsSource);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, () => setFailed(true));
      return () => hls.destroy();
    } else {
      setFailed(true);
    }
  }, [hlsSource, loadingToken]);

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

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/70 text-white text-center px-4 relative`}>
        <a href={hlsSource || resolvedUrl} target="_blank" rel="noreferrer" className="underline text-devotion-gold font-black">
          {fallbackLabel}
        </a>
        <button onClick={() => setShowTools(v => !v)} className="absolute top-2 left-2 bg-devotion-gold/20 text-devotion-gold rounded-full px-2 py-1 text-xs font-bold">⋮</button>
        {showTools && <AdvancedTools />}
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-auto rounded-xl shadow-lg"
        src={hlsSource || resolvedUrl}
        autoPlay={effectiveShouldPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        onError={() => setFailed(true)}
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
      {(hlsSource || resolvedUrl) && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-devotion-gold text-xs px-3 py-1 rounded-full font-bold shadow-lg">
          {hlsSource ? 'HLS / CDN' : 'CDN'}
        </div>
      )}
    </div>
  );
}
