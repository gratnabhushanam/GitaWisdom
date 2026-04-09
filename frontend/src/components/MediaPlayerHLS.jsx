import React, { useEffect, useRef, useState } from 'react';
import { getYoutubeEmbedUrl, getYoutubeVideoId, isYoutubeUrl, resolveMediaUrl } from '../utils/media';

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
  const videoRef = useRef(null);
  const resolvedUrl = resolveMediaUrl(url);
  const effectiveShouldPlay = typeof shouldPlay === 'boolean' ? shouldPlay : autoPlay;
  const hlsSource = hlsUrl || '';

  if (!resolvedUrl && !hlsSource) return null;

  if (isYoutubeUrl(resolvedUrl)) {
    const embedUrl = getYoutubeEmbedUrl(resolvedUrl);
    const videoId = getYoutubeVideoId(resolvedUrl);
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
        title={title || 'Video player'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  // HLS playback logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsSource) return;
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
  }, [hlsSource]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/70 text-white text-center px-4`}>
        <a href={hlsSource || resolvedUrl} target="_blank" rel="noreferrer" className="underline text-devotion-gold font-black">
          {fallbackLabel}
        </a>
      </div>
    );
  }

  // Fallback to MP4 if no HLS or HLS fails
  if (hlsSource) {
    return (
      <video
        ref={videoRef}
        className={className}
        autoPlay={effectiveShouldPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        onError={() => setFailed(true)}
      />
    );
  }

  // Default MP4 playback
  return (
    <video
      ref={videoRef}
      className={className}
      src={resolvedUrl}
      autoPlay={effectiveShouldPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline={playsInline}
      onError={() => setFailed(true)}
    />
  );
}
