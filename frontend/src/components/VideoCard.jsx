import React from 'react';

export default function VideoCard({ title, url, videoUrl, description }) {
  // Extract video ID for YouTube thumbnail
  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const resolvedUrl = videoUrl || url || '';
  const videoId = getYoutubeVideoId(resolvedUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
    : 'https://images.unsplash.com/photo-1614850715649-1d0106293cb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-[#0B1F3A]/60 backdrop-blur rounded-2xl overflow-hidden shadow-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-yellow-500 text-black w-16 h-16 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
          </button>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-yellow-400 transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
