import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Film, Calendar, History, Play, X, ArrowRight, Star, Sparkles, Heart } from 'lucide-react';
import MediaPlayerHLS from '../components/MediaPlayerHLS';

export default function Movies() {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const openMovieId = location.state?.openMovieId;
    if (!openMovieId || movies.length === 0 || selectedMovie) return;

    const matchedMovie = movies.find((movie) => String(movie._id || movie.id) === String(openMovieId));
    if (matchedMovie) {
      setSelectedMovie(matchedMovie);
    }
  }, [location.state, movies, selectedMovie]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050B14] text-white">
      
      <style>{`
        @keyframes sparkle-bg {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.32; }
        }
        .animate-sparkle-bg {
          background: repeating-radial-gradient(circle at 60% 30%, #FFD70044 0 2px, transparent 3px 100px), repeating-radial-gradient(circle at 20% 80%, #FFD70033 0 1.5px, transparent 2.5px 100px);
          animation: sparkle-bg 3.5s ease-in-out infinite;
        }
        @keyframes float-streak {
          0% { transform: translate(-100px, 100px) rotate(45deg); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translate(100vw, -100vh) rotate(45deg); opacity: 0; }
        }
        .light-streak {
          position: absolute;
          width: 300px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
          animation: float-streak 8s linear infinite;
          filter: blur(4px);
          pointer-events: none;
        }
      `}</style>

      {/* Cinematic Deep Dark Background */}
      <div className="absolute inset-0 bg-[#020610] z-0"></div>
      
      {/* Sacred Geometry & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,159,28,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,50,100,0.4),transparent_50%)]"></div>
      
      {/* Subtle Om Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.03]">
         <span className="text-[60vw] font-black text-white mix-blend-overlay">ॐ</span>
      </div>

      {/* Sparkle Particles & Light Streaks */}
      <div className="pointer-events-none absolute inset-0 z-10 animate-sparkle-bg" />
      <div className="light-streak" style={{ top: '80%', left: '-10%', animationDelay: '0s' }}></div>
      <div className="light-streak" style={{ top: '40%', left: '-20%', animationDelay: '3s' }}></div>
      <div className="light-streak" style={{ top: '100%', left: '30%', animationDelay: '5s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Cinematic Header */}
        <div className="text-center mb-24 animate-fade-in-up">
           <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-devotion-gold/40 bg-devotion-gold/5 backdrop-blur-xl mb-8 text-devotion-gold text-[11px] font-black tracking-[0.5em] uppercase shadow-[0_0_30px_rgba(255,215,0,0.1)]">
              <Sparkles className="w-4 h-4 animate-pulse" /> Cinematic Legacy
           </div>
           <h1 className="text-7xl md:text-9xl font-serif font-black text-white mb-8 tracking-tighter uppercase leading-none">
             Divine <span className="text-devotion-gold italic font-light tracking-normal opacity-90">Cinema</span>
           </h1>
           <p className="text-2xl text-gray-400 font-serif italic max-w-3xl mx-auto leading-relaxed">"Exploring stories of valor and spirit that define our journey."</p>
        </div>

        {/* Cinematic Movie List - Premium Stream Cards */}
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 pb-20">
          {movies.map((movie, index) => (
            <TeaserCard
              key={movie._id || movie.id || index}
              video={movie}
              index={index}
              onSelect={setSelectedMovie}
            />
          ))}
        </div>

        {/* Empty State */}
        {movies.length === 0 && (
           <div className="text-center py-40 bg-glass-gradient rounded-[4rem] border-2 border-dashed border-white/5">
              <Film className="w-24 h-24 text-gray-800 mx-auto mb-8 opacity-20" />
              <p className="text-3xl font-serif italic text-gray-600">Cinematic historical narratives are being curated.</p>
           </div>
        )}
      </div>

      {/* Cinematic Movie Modal with Title Card Layout */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-[#0F2027]/95 backdrop-blur-3xl overflow-y-auto">
           <div className="relative w-full max-w-7xl bg-gradient-to-br from-[#0F2027] to-[#2C5364] rounded-[20px] shadow-[0_0_150px_rgba(255,215,0,0.15)] border border-white/10 flex flex-col mt-auto md:mt-0 mb-auto overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen"></div>
              
              <div className="relative w-full aspect-video bg-zinc-950 rounded-t-[20px] overflow-hidden">
                  <div className="absolute inset-0 bg-[#FFD700] opacity-10 pointer-events-none blur-3xl"></div>

                  <MediaPlayerHLS
                    url={selectedMovie.videoUrl || selectedMovie.youtubeUrl || selectedMovie.url}
                    hlsUrl={selectedMovie.hlsUrl}
                    title={selectedMovie.title}
                    className="w-full h-full relative z-10 object-contain bg-black"
                    youtubeParams="autoplay=1&rel=0&modestbranding=1"
                    autoPlay
                    controls
                    playLimitSeconds={120}
                  />
              </div>

              <div className="p-6 md:p-10 flex flex-col gap-4 relative overflow-hidden">
                 {/* Decorative background blur */}
                 <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FFD700]/10 blur-[120px] rounded-full"></div>
                 
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                     <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#FFD700] text-[#0F2027] px-3 py-1 rounded-lg font-black text-[10px] tracking-widest uppercase shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                               TEASER PLAY
                            </span>
                            <span className="text-gray-300 text-sm tracking-widest uppercase font-bold">
                               {selectedMovie.releaseYear || 'NEW'}
                            </span>
                         </div>
                         <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white to-[#FFD700] bg-clip-text text-transparent tracking-widest uppercase font-serif drop-shadow-md">
                            {selectedMovie.title}
                         </h2>
                         <p className="text-gray-300 mt-2 max-w-3xl text-sm md:text-base leading-relaxed opacity-90">
                            {selectedMovie.desc || selectedMovie.description || "Immerse yourself in this divine cinematic experience. Explore stories of valor and spirit that define our journey."}
                         </p>
                     </div>
                     
                     <div className="flex items-center gap-3 w-full md:w-auto">
                         <button className="flex-1 md:flex-none uppercase bg-transparent border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 px-6 py-4 rounded-xl font-black tracking-widest transition-all whitespace-nowrap text-xs shadow-[0_0_20px_rgba(255,215,0,0.15)] glow-effect">
                             Watchlist
                         </button>
                         <button 
                             onClick={() => setSelectedMovie(null)} 
                             className="flex-1 md:flex-none uppercase bg-white/5 hover:bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold tracking-widest transition-colors text-xs"
                         >
                             Close
                         </button>
                     </div>
                 </div>
              </div>

           </div>
        </div>
      )}

    </div>
  );
}

function TeaserCard({ video, isFavorite = () => false, toggleFavorite = () => {}, onSelect, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e) => {
    if (!isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg
    const rotateY = ((x - centerX) / centerX) * 10;
    setMousePos({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDesktop) {
      hoverTimeoutRef.current = setTimeout(() => setShowVideo(true), 600); // 600ms delay for auto-play
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideo(false);
    clearTimeout(hoverTimeoutRef.current);
    setMousePos({ x: 0, y: 0 });
  };

  const extractYoutubeId = (url) => { 
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/); 
    return match ? match[1] : null; 
  };
  
  const videoUrl = video.videoUrl || video.youtubeUrl || video.url || '';
  const ytId = extractYoutubeId(videoUrl);
  // Prefer provided thumbnail, fallback to YT maxresdefault, then to placeholder
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '/scene-krishna.svg');
  // Simple logic to show 'New' badge for first two items
  const isNew = index < 2;

  return (
    <div 
      className="relative preserve-3d transition-transform duration-300 ease-out cursor-pointer h-[480px] landscape:h-[340px] md:landscape:h-[480px]"
      style={{ 
        transform: isHovered && isDesktop ? `perspective(1000px) rotateX(${mousePos.x}deg) rotateY(${mousePos.y}deg) scale3d(1.02, 1.02, 1.02)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        zIndex: isHovered ? 50 : 1
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(video)}
    >
      {/* Golden Glowing Border Effect */}
      <div 
        className="absolute -inset-1 bg-gradient-to-r from-devotion-gold via-[#FF9F1C] to-devotion-gold rounded-[2.5rem] blur-md transition-opacity duration-500 pointer-events-none" 
        style={{ opacity: isHovered ? 0.6 : 0 }}
      ></div>
      
      {/* Main Card Container */}
      <div className="relative h-full w-full bg-[#0A1A2F] rounded-[2.5rem] border border-devotion-gold/30 overflow-hidden shadow-2xl backface-hidden flex flex-col group">
        
        {/* Thumbnail or Video Background */}
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src={thumbUrl} 
            alt={video.title}
            className={`w-full h-full object-cover opacity-80 transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          
          {showVideo && ytId && (
            <div className="absolute inset-0 z-10 bg-black animate-fade-in-up">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${ytId}`}
                className="w-full h-[150%] -translate-y-[15%] object-cover pointer-events-none opacity-80"
                allow="autoplay; encrypted-media"
                frameBorder="0"
                title="Teaser Preview"
              />
            </div>
          )}
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06101E] via-[#06101E]/60 to-transparent z-20 transition-opacity duration-500 group-hover:opacity-90"></div>
        </div>

        {/* Shimmer Light Sweep */}
        {isHovered && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[2.5rem]">
             <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-6 left-0 flex justify-between w-full px-6 z-30 translate-z-20">
          <div className="flex gap-2">
            {isNew && (
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                New
              </span>
            )}
            {video.duration && (
              <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full">
                {video.duration}
              </span>
            )}
          </div>
          <button
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/20 backdrop-blur-md transition-all ${isFavorite(video) ? 'bg-devotion-gold/20 text-devotion-gold border-devotion-gold' : 'bg-black/40 text-white/80 hover:bg-white/20'}`}
            title={isFavorite(video) ? 'Remove from favorites' : 'Add to favorites'}
            onClick={e => { e.stopPropagation(); toggleFavorite(video); }}
          >
            <Heart className={`w-5 h-5 ${isFavorite(video) ? 'fill-devotion-gold stroke-devotion-gold' : 'fill-none stroke-current'}`} />
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-auto p-8 relative z-30 translate-z-30 flex flex-col items-center text-center">
          <div className={`w-16 h-16 landscape:w-12 landscape:h-12 md:landscape:w-16 md:landscape:h-16 bg-devotion-gold/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-devotion-gold/40 mb-6 landscape:mb-2 md:landscape:mb-6 transition-all duration-500 shadow-[0_0_30px_rgba(255,215,0,0.3)] ${isHovered ? 'scale-110 bg-devotion-gold text-devotion-darkBlue shadow-[0_0_50px_rgba(255,215,0,0.6)]' : 'text-devotion-gold'}`}>
             <Play className="w-8 h-8 landscape:w-6 landscape:h-6 md:landscape:w-8 md:landscape:h-8 ml-1 fill-current" />
          </div>
          
          <h3 className="text-2xl md:text-3xl landscape:text-xl md:landscape:text-3xl font-serif font-black text-white mb-3 landscape:mb-1 md:landscape:mb-3 leading-tight drop-shadow-xl tracking-tight">
            {video.chapter ? `Ch ${video.chapter}: ` : ''}{video.title}
          </h3>
          
          <p className="text-gray-300 font-light text-sm landscape:text-xs md:landscape:text-sm mb-6 landscape:mb-2 md:landscape:mb-6 line-clamp-2 landscape:line-clamp-1 md:landscape:line-clamp-2 leading-relaxed opacity-80">
            {video.description || "Divine cinematic adventure awaits!"}
          </p>

          <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 shadow-2xl ${isHovered ? 'bg-gradient-to-r from-devotion-gold to-[#FF9F1C] text-devotion-darkBlue scale-105' : 'bg-white/10 border border-white/20 text-white backdrop-blur-md'}`}>
            Watch Now
          </button>
        </div>
      </div>
    </div>
  );
}
