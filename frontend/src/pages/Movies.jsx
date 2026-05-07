import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Film, Play, X, Star, Sparkles, Heart, Maximize, ChevronRight } from 'lucide-react';
import MediaPlayerHLS from '../components/MediaPlayerHLS';

export default function Movies() {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    const openMovieId = location.state?.openMovieId;
    if (!openMovieId || movies.length === 0 || selectedMovie) return;
    const matchedMovie = movies.find((m) => String(m._id || m.id) === String(openMovieId));
    if (matchedMovie) setSelectedMovie(matchedMovie);
  }, [location.state, movies, selectedMovie]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#06101E]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-devotion-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]"></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 landscape:pt-14 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050B14] text-white pl-safe pr-safe">
      <style>{`
        @keyframes sparkle-bg { 0%,100%{opacity:.18} 50%{opacity:.32} }
        .animate-sparkle-bg {
          background: repeating-radial-gradient(circle at 60% 30%,#FFD70044 0 2px,transparent 3px 100px),
          repeating-radial-gradient(circle at 20% 80%,#FFD70033 0 1.5px,transparent 2.5px 100px);
          animation: sparkle-bg 3.5s ease-in-out infinite;
        }
        @keyframes float-streak {
          0%{transform:translate(-100px,100px) rotate(45deg);opacity:0}
          50%{opacity:.4}
          100%{transform:translate(100vw,-100vh) rotate(45deg);opacity:0}
        }
        .light-streak {
          position:absolute;width:300px;height:2px;
          background:linear-gradient(90deg,transparent,rgba(255,215,0,.6),transparent);
          animation:float-streak 8s linear infinite;filter:blur(4px);pointer-events:none;
        }
        @media (orientation:landscape) and (max-width:1024px) {
          .landscape-header { display: none !important; }
          .landscape-mini-header { display: flex !important; }
          .movie-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
        .landscape-mini-header { display: none; }
      `}</style>

      {/* Background layers */}
      <div className="absolute inset-0 bg-[#020610] z-0"></div>
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,159,28,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,50,100,0.4),transparent_50%)]"></div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <span className="text-[60vw] font-black text-white mix-blend-overlay">ॐ</span>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 animate-sparkle-bg" />
      <div className="light-streak" style={{ top: '80%', left: '-10%', animationDelay: '0s' }}></div>
      <div className="light-streak" style={{ top: '40%', left: '-20%', animationDelay: '3s' }}></div>

      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Desktop / Portrait Header */}
        <div className="landscape-header text-center mb-12 md:mb-24 animate-fade-in-up px-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-devotion-gold/40 bg-devotion-gold/5 backdrop-blur-xl mb-8 text-devotion-gold text-[11px] font-black tracking-[0.5em] uppercase shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <Sparkles className="w-4 h-4 animate-pulse" /> Cinematic Legacy
          </div>
          <h1 className="text-5xl md:text-9xl font-serif font-black text-white mb-6 tracking-tighter uppercase leading-none">
            Divine <span className="text-devotion-gold italic font-light tracking-normal opacity-90">Cinema</span>
          </h1>
          <p className="text-xl text-gray-400 font-serif italic max-w-3xl mx-auto leading-relaxed">"Exploring stories of valor and spirit that define our journey."</p>
        </div>

        {/* Landscape Mini-Header */}
        <div className="landscape-mini-header items-center gap-3 mb-6 animate-fade-in-up bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 sticky top-2 z-50">
          <Film className="w-5 h-5 text-devotion-gold" />
          <span className="text-devotion-gold font-black text-sm uppercase tracking-widest">Divine Cinema</span>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-tighter">{movies.length} titles curated</span>
        </div>

        {/* Movie Grid */}
        <div className="movie-grid grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-20 relative z-10 px-2 md:px-0">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie._id || movie.id || index}
              video={movie}
              index={index}
              onSelect={setSelectedMovie}
            />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-32 bg-glass-gradient rounded-[4rem] border-2 border-dashed border-white/5">
            <Film className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-20" />
            <p className="text-2xl font-serif italic text-gray-600">Cinematic narratives are being curated.</p>
          </div>
        )}
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}

function MovieModal({ movie, onClose }) {
  const videoRef = useRef(null);

  const handleFullscreen = () => {
    const el = videoRef.current?.querySelector('video') || videoRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
      if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#02060B]/98 backdrop-blur-2xl flex flex-col overflow-y-auto pl-safe pr-safe">
      {/* Close */}
      <button onClick={onClose} className="fixed top-4 right-4 z-[80] bg-black/60 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500/40 transition-all active:scale-90 shadow-2xl" aria-label="Close">
        <X className="w-5 h-5" />
      </button>

      {/* Video Panel */}
      <div
        ref={videoRef}
        className="relative w-full bg-black flex-shrink-0 z-10 shadow-[0_10px_60px_rgba(0,0,0,0.8)]"
      >
        <div className="max-w-6xl mx-auto w-full aspect-video">
          <MediaPlayerHLS
            url={movie.videoUrl || movie.youtubeUrl || movie.url}
            hlsUrl={movie.hlsUrl}
            title={movie.title}
            className="w-full h-full object-contain bg-black"
            youtubeParams="autoplay=1&rel=0&modestbranding=1"
            autoPlay
            controls
            playLimitSeconds={120}
          />
        </div>
        {/* Fullscreen button overlay */}
        <button
          onClick={handleFullscreen}
          className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 hover:bg-devotion-gold/20 hover:border-devotion-gold/50 transition-all z-20 active:scale-95 shadow-xl"
          title="Go Fullscreen (Landscape)"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel — REFINED BACKGROUND & REDUCED CARD WIDTH */}
      <div className="w-full min-h-screen bg-[#06101E] p-6 md:p-12 relative overflow-hidden">
        {/* Cinematic Radial Accents */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-devotion-gold/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-10">
          
          <div className="border-b border-white/5 pb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-devotion-gold text-[#0F2027] px-3 py-1 rounded-lg font-black text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                CINEMATIC PREVIEW
              </span>
              <span className="text-devotion-gold/60 text-[10px] tracking-[0.4em] uppercase font-black">
                {movie.releaseYear || 'EST. 2025'}
              </span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black bg-gradient-to-r from-white via-white to-devotion-gold bg-clip-text text-transparent tracking-tighter uppercase font-serif drop-shadow-2xl mb-6 leading-none">
              {movie.title}
            </h2>
            <p className="text-gray-400 text-lg md:text-2xl leading-relaxed opacity-90 max-w-2xl font-serif italic border-l-2 border-devotion-gold/30 pl-6">
              {movie.desc || movie.description || 'Immerse yourself in this divine cinematic experience.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Left Col: Story Context */}
            <div className="space-y-6 flex flex-col">
              {movie.ownerHistory && (
                <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl rounded-[2rem] p-8 shadow-2xl transition-transform hover:scale-[1.01] flex-1">
                  <p className="text-devotion-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Divine Context</p>
                  <p className="text-gray-200 text-base md:text-lg leading-relaxed font-serif italic">{movie.ownerHistory}</p>
                </div>
              )}

              <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 rounded-[2rem] p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-devotion-gold/10 flex items-center justify-center border border-devotion-gold/20">
                      <Star className="text-devotion-gold w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Cinematic Highlights</span>
                </div>
                <ul className="space-y-4">
                  {['Epic storytelling and visuals', 'Traditional wisdom modernized', 'Musical journey of devotion'].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-devotion-gold group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(255,215,0,0.8)]"></div>
                      <span className="text-gray-400 text-sm font-bold group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Actions */}
            <div className="space-y-6">
               <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-2xl">
                  <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2 text-center opacity-60">Immersive Experience</p>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleFullscreen}
                      className="w-full bg-devotion-gold text-[#0F2027] px-8 py-5 rounded-2xl font-black tracking-widest transition-all text-xs uppercase flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95"
                    >
                      <Maximize className="w-5 h-5" /> FULLSCREEN VIEW
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-5 rounded-2xl font-black tracking-widest transition-all text-xs uppercase active:scale-95"
                    >
                      RETURN TO GALLERY
                    </button>
                  </div>
               </div>

               <div className="bg-gradient-to-r from-devotion-gold/5 to-transparent border border-devotion-gold/20 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-xl group cursor-default">
                  <div className="w-16 h-16 rounded-2xl bg-devotion-gold/10 flex items-center justify-center flex-shrink-0 border border-devotion-gold/20 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all">
                    <Play className="text-devotion-gold w-8 h-8 fill-devotion-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-devotion-gold uppercase tracking-[0.3em] mb-1 opacity-70">Now Streaming</p>
                    <p className="text-white font-black text-lg truncate uppercase tracking-tighter">{movie.title}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">4K Divine Resolution</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ video, isFavorite = () => false, toggleFavorite = () => {}, onSelect, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDesktop) hoverTimeoutRef.current = setTimeout(() => setShowVideo(true), 600);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideo(false);
    clearTimeout(hoverTimeoutRef.current);
  };

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : null;
  };

  const videoUrl = video.videoUrl || video.youtubeUrl || video.url || '';
  const ytId = extractYoutubeId(videoUrl);
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '/scene-krishna.svg');
  const isNew = index < 2;

  return (
    <div
      className="relative cursor-pointer group rounded-[2rem] overflow-hidden shadow-2xl border border-devotion-gold/20
                 h-[320px] landscape:h-[240px] sm:h-[400px] md:h-[480px] md:landscape:h-[480px]
                 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,215,0,0.2)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(video)}
    >
      {/* Golden glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-devotion-gold via-[#FF9F1C] to-devotion-gold rounded-[2rem] blur-md transition-opacity duration-500 pointer-events-none"
        style={{ opacity: isHovered ? 0.5 : 0 }}></div>

      {/* Thumbnail */}
      <div className="absolute inset-0 bg-black">
        <img
          src={thumbUrl}
          alt={video.title}
          loading="lazy"
          className={`w-full h-full object-cover opacity-80 transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        {showVideo && ytId && (
          <div className="absolute inset-0 z-10 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${ytId}`}
              className="w-full h-[150%] -translate-y-[15%] pointer-events-none opacity-80"
              allow="autoplay; encrypted-media"
              frameBorder="0"
              title="Preview"
            />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06101E] via-[#06101E]/50 to-transparent z-20"></div>
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        {isNew && <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">New</span>}
        {video.releaseYear && <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">{video.releaseYear}</span>}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 landscape:p-4 md:landscape:p-6 z-30 flex flex-col items-start">
        <div className={`w-10 h-10 landscape:w-8 landscape:h-8 md:landscape:w-12 md:landscape:h-12 bg-devotion-gold/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-devotion-gold/40 mb-3 landscape:mb-2 transition-all duration-500 ${isHovered ? 'bg-devotion-gold text-devotion-darkBlue scale-110 shadow-[0_0_30px_rgba(255,215,0,0.5)]' : 'text-devotion-gold'}`}>
          <Play className="w-5 h-5 ml-0.5 fill-current" />
        </div>
        <h3 className="text-lg landscape:text-[13px] md:landscape:text-xl md:text-2xl font-serif font-black text-white mb-1 leading-tight drop-shadow-xl line-clamp-2 uppercase">
          {video.title}
        </h3>
        <p className="text-gray-300 text-xs landscape:hidden md:landscape:block mb-3 line-clamp-1 opacity-70 italic font-serif">
          {video.description || 'A divine cinematic experience.'}
        </p>
        <button className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${isHovered ? 'bg-devotion-gold text-devotion-darkBlue scale-105' : 'bg-white/10 border border-white/20 text-white backdrop-blur-md'}`}>
          Watch Trailer
        </button>
      </div>
    </div>
  );
}
