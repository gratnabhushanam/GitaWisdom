import React from 'react';

export default function StoryCard({ title, description, chapter, language }) {
  return (
    <div className="group bg-[#0B1F3A]/80 backdrop-blur border border-yellow-500/20 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            Chapter {chapter}
          </span>
          <span className="text-xs text-gray-400">{language}</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed">
          {description}
        </p>
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <button className="text-yellow-500 text-sm font-medium hover:text-yellow-400 transition-colors flex items-center gap-1">
            Read More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
