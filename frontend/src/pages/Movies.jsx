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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#0A0F2C] to-[#020617] text-white">
      
      {/* Cinematic Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         {/* Subtle temple background blur behind poster */}
         <div 
           className="absolute top-0 right-0 w-full lg:w-3/4 h-[80vh] opacity-[0.03] mix-blend-screen bg-cover bg-right-top blur-md" 
           style={{ backgroundImage: `url('/scene-krishna.svg')` }}
         ></div>
         <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#0A0F2C] blur-[140px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#020617] blur-[150px] rounded-full"></div>
         {/* Golden aura highlights */}
         <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-devotion-gold/5 blur-[120px] rounded-full"></div>
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

        {/* Cinematic Movie List - Grid Kids Card Type */}
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 pb-20">
          {movies.map((movie, index) => {
            const kidsColors = [
                'bg-gradient-to-br from-[#FFE5B4] to-[#FFF8DC]',
                'bg-gradient-to-br from-[#E6F7FF] to-[#F0FFFF]',
                'bg-gradient-to-br from-[#E6FFE6] to-[#F0FFF0]',
                'bg-gradient-to-br from-[#FFF0F5] to-[#FCE6F0]'
            ];
            const activeColor = kidsColors[index % kidsColors.length];

            return (
              <div 
                key={movie._id}
                className={`p-6 rounded-[2.5rem] border border-white/20 backdrop-blur-3xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer group relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${activeColor}`}
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="absolute -top-10 -right-10 text-black/5 text-[10rem] group-hover:rotate-12 transition-transform select-none">🕉️</div>
                
                <div className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-lg mb-6 border border-white/40">
                     <img 
                       src={movie.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                       alt={movie.title}
                       className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                       onError={(e) => {
                         e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                       }}
                     />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-gray-900 shadow-xl drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                           <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                     </div>
                     <div className="absolute top-4 left-4 bg-white/90 text-gray-900 px-3 py-1 rounded-lg font-black text-[10px] tracking-widest uppercase shadow-md">
                        {movie.releaseYear || 'NEW'}
                     </div>
                </div>

                <div className="relative z-10 flex flex-col h-full flex-grow">
                  <h3 className="text-2xl font-serif font-black text-gray-900 mb-2 leading-tight drop-shadow-sm uppercase">
                    {movie.title}
                  </h3>
                  
                  <p className="text-gray-700 font-medium text-sm mb-6 line-clamp-3 leading-relaxed border-l-2 border-gray-400 pl-3 italic">
                    {movie.description || movie.ownerHistory}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:translate-y-1">
                      Begin <Play className="w-4 h-4 fill-current" />
                    </button>
                    <div className="flex gap-2">
                       {(movie.tags || []).slice(0,2).map(tag => (
                         <span key={tag} className="px-3 py-1 bg-black/5 rounded-xl text-gray-600 text-[8px] font-black uppercase tracking-widest border border-black/10">
                           #{tag}
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-3xl overflow-y-auto">
           <div className="relative w-full max-w-7xl bg-gradient-to-b from-[#0A0F2C] to-[#020617] rounded-[2rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(250,204,21,0.15)] border border-white/10 flex flex-col mt-auto md:mt-0 mb-auto">
              
              <div className="relative w-full aspect-video bg-zinc-950 rounded-t-[2rem] md:rounded-t-[3rem] overflow-hidden">
                  <div className="absolute inset-0 bg-gold-glow opacity-10 pointer-events-none"></div>

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
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-devotion-gold/5 blur-[100px]"></div>
                 
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                     <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#FACC15] text-[#020617] px-3 py-1 rounded-lg font-black text-[10px] tracking-widest uppercase">
                               TEASER PLAY
                            </span>
                            <span className="text-gray-400 text-sm tracking-widest uppercase font-bold">
                               {selectedMovie.releaseYear || 'NEW'}
                            </span>
                         </div>
                         <h2 className="text-3xl md:text-5xl font-serif text-white tracking-widest uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {selectedMovie.title}
                         </h2>
                         <p className="text-gray-400 mt-2 max-w-3xl text-sm md:text-base leading-relaxed">
                            {selectedMovie.desc || selectedMovie.description || "Immerse yourself in this divine cinematic experience. Explore stories of valor and spirit that define our journey."}
                         </p>
                     </div>
                     
                     <div className="flex items-center gap-3 w-full md:w-auto">
                         <button className="flex-1 md:flex-none uppercase bg-transparent border border-devotion-gold text-devotion-gold hover:bg-devotion-gold/10 px-6 py-4 rounded-xl font-bold tracking-widest transition-all whitespace-nowrap text-xs shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                             Watchlist
                         </button>
                         <button 
                             onClick={() => setSelectedMovie(null)} 
                             className="flex-1 md:flex-none uppercase bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-bold tracking-widest transition-colors text-xs"
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
