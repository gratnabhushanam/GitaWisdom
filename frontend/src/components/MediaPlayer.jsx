import React, { useEffect, useRef, useState } from 'react';
import { getYoutubeEmbedUrl, getYoutubeVideoId, isYoutubeUrl, resolveMediaUrl } from '../utils/media';

export default function MediaPlayer({
  url,
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

  if (!resolvedUrl) return null;

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

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/70 text-white text-center px-4`}>
        <a href={resolvedUrl} target="_blank" rel="noreferrer" className="underline text-devotion-gold font-black">
          {fallbackLabel}
        </a>
      </div>
    );
  }

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (effectiveShouldPlay) {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    } else {
      el.pause();
    }
  }, [effectiveShouldPlay, resolvedUrl]);

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