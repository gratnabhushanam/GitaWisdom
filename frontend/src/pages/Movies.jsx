import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Film, Calendar, History, Play, X, ArrowRight, Star, Sparkles } from 'lucide-react';
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
      
      {/* Cinematic Background Decor - Animated Floating Galaxy */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         {/* Stardust universe texture overlay */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
         
         {/* Cosmic Indigo & Royal Purple Radial Glows */}
         <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2E1065]/30 via-[#1E1B4B]/10 to-transparent blur-[100px] rounded-full animate-[spin_60s_linear_infinite] origin-center opacity-80"></div>
         
         <div className="absolute bottom-[-30%] right-[-20%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A2F5C]/40 via-[#0F172A]/20 to-transparent blur-[150px] rounded-full animate-[spin_90s_linear_infinite_reverse] origin-center opacity-80"></div>
         
         {/* Spiritual Sunrise Gold Glow (Horizon/Center) */}
         <div className="absolute top-[20%] left-[50%] -translate-x-[50%] w-[150vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFD700]/10 via-[#B45309]/5 to-transparent blur-[120px] animate-[pulse_12s_ease-in-out_infinite]"></div>

         {/* Subtle temple/krishna background blur behind poster */}
         <div 
           className="absolute top-0 right-0 w-full lg:w-3/4 h-[90vh] opacity-[0.06] mix-blend-screen bg-cover bg-right-top blur-[3px] animate-float" 
           style={{ backgroundImage: `url('/scene-krishna.svg')` }}
         ></div>
      </div>

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
          {movies.map((movie) => (
            <div 
              key={movie._id}
              className="flex flex-col p-4 md:p-5 rounded-[20px] bg-gradient-to-br from-[#F5E6C8] to-[#E6C068] border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.25)] transition-all duration-500 transform hover:scale-[1.08] hover:border-[#FFD700] hover:shadow-[0_15px_35px_rgba(255,215,0,0.3)] hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
              onClick={() => setSelectedMovie(movie)}
            >
              {/* Subtle inner glow and shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out w-[200%] -translate-x-[100%] group-hover:translate-x-[50%] pointer-events-none z-20"></div>
              
              <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.7)] rounded-[20px] pointer-events-none"></div>

              {/* Thumbnail Top */}
              <div className="relative w-full aspect-[16/9] rounded-[14px] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)] mb-5 border border-black/5 z-10">
                   <img 
                     src={movie.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                     alt={movie.title}
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                     onError={(e) => {
                       e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-70 group-hover:opacity-30 transition-colors"></div>
                   
                   <div className="absolute top-3 left-3 bg-white/90 text-[#020617] px-3 py-1 rounded font-black text-[10px] tracking-widest uppercase shadow-md backdrop-blur-md">
                      {movie.releaseYear || 'NEW'}
                   </div>
                   
                   {/* Play Button overlay */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center text-gray-900 shadow-[0_0_20px_rgba(255,255,255,0.8)] backdrop-blur-md">
                         <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                   </div>
              </div>

              {/* Content Bottom */}
              <div className="relative z-10 flex flex-col flex-grow px-2">
                <h3 className="text-xl md:text-2xl font-black text-[#020617] mb-2 leading-tight uppercase font-serif tracking-wide drop-shadow-sm line-clamp-1">
                  {movie.title}
                </h3>
                
                <p className="text-gray-600 font-medium text-xs md:text-sm mb-6 line-clamp-2 leading-relaxed">
                  {movie.description || movie.ownerHistory}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-black/10">
                  <div className="flex gap-1.5">
                     {(movie.tags || []).slice(0,2).map(tag => (
                       <span key={tag} className="px-2 py-1 bg-[#020617]/5 rounded text-[#020617]/70 text-[8px] font-black uppercase tracking-widest border border-[#020617]/10">
                         {tag}
                       </span>
                     ))}
                  </div>
                  <button className="bg-[#0F2027] text-[#FFD700] px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg group-hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all active:scale-95 group-hover:-translate-y-1 hover:bg-[#1A3644]">
                    Watch <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            </div>
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
