import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Film, Calendar, History, Play, X, ArrowRight, Star, Sparkles } from 'lucide-react';
import MediaPlayer from '../components/MediaPlayer';

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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#06101E] text-white">
      
      {/* Cinematic Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-devotion-gold/5 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-devotion-maroon/10 blur-[150px] rounded-full"></div>
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

        {/* Cinematic Movie List */}
        <div className="space-y-32">
          {movies.map((movie, index) => (
            <div 
              key={movie._id}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center animate-fade-in-up`}
            >
               {/* Poster Frame */}
               <div className="w-full lg:w-3/5 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-br from-devotion-gold/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  
                  <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] group-hover:border-devotion-gold/30 transition-all duration-700">
                     <img 
                       src={movie.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
                       alt={movie.title}
                       className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                       onError={(e) => {
                         e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                       }}
                     />
                     
                     <div className="absolute inset-0 bg-gradient-to-t from-[#06101E] via-transparent to-transparent opacity-60"></div>
                     
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40">
                        <button 
                          onClick={() => setSelectedMovie(movie)}
                          className="w-28 h-28 bg-devotion-gold rounded-full flex items-center justify-center text-devotion-darkBlue transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-[0_0_50px_rgba(255,215,0,0.4)]"
                        >
                           <Play className="w-12 h-12 fill-current ml-2" />
                        </button>
                     </div>

                     <div className="absolute bottom-8 left-8 flex items-center gap-4">
                        <div className="bg-devotion-gold text-devotion-darkBlue px-5 py-2 rounded-xl font-black text-xs shadow-2xl tracking-widest">
                           {movie.releaseYear}
                        </div>
                        <div className="backdrop-blur-xl bg-white/10 border border-white/10 text-white px-5 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase">
                           SPOTLIGHT
                        </div>
                     </div>
                  </div>
               </div>

               {/* Cinematic Details */}
               <div className="w-full lg:w-2/5 space-y-8">
                  <div className="flex items-center gap-4 text-devotion-gold font-black text-[10px] tracking-[0.4em] uppercase">
                     <History className="w-4 h-4" /> Personal Selection
                  </div>
                  
                  <h2 className="text-6xl md:text-8xl font-serif font-black text-white tracking-tighter uppercase leading-tight group-hover:text-devotion-gold transition-colors">
                    {movie.title}
                  </h2>

                  <div className="relative pl-8 border-l-2 border-devotion-gold/30 italic">
                     <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-devotion-gold rounded-full blur-sm"></div>
                     <p className="text-gray-300 text-xl font-serif leading-relaxed opacity-90">
                       "{movie.ownerHistory}"
                     </p>
                  </div>

                  <p className="text-gray-400 text-lg leading-relaxed font-light">
                    {movie.description}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-4">
                     {(movie.tags || []).map(tag => (
                       <span key={tag} className="px-5 py-2 bg-white/5 rounded-2xl border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest hover:border-devotion-gold hover:text-devotion-gold transition-all cursor-default">
                         #{tag}
                       </span>
                     ))}
                  </div>

                  <div className="pt-8">
                    <button 
                      onClick={() => setSelectedMovie(movie)}
                      className="group/btn relative inline-flex items-center gap-6 bg-gradient-to-r from-devotion-gold to-yellow-500 text-devotion-darkBlue px-12 py-6 rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase hover:shadow-[0_20px_60px_rgba(255,215,0,0.3)] transition-all transform hover:-translate-y-2 active:scale-95"
                    >
                       Begin Experience
                       <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
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

      {/* Cinematic Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 bg-black/98 backdrop-blur-3xl">
           <div className="relative w-full max-w-7xl aspect-video bg-zinc-950 rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(255,215,0,0.15)] border border-white/10">
              <button 
                onClick={() => setSelectedMovie(null)}
                className="absolute top-8 right-8 z-20 bg-black/50 hover:bg-red-500 text-white p-4 rounded-[1.5rem] transition-all border border-white/10 hover:scale-110 active:scale-90"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="absolute inset-0 bg-gold-glow opacity-10 pointer-events-none"></div>

              <MediaPlayer
                url={selectedMovie.videoUrl || selectedMovie.youtubeUrl || selectedMovie.url}
                title={selectedMovie.title}
                className="w-full h-full relative z-10 object-cover bg-black"
                youtubeParams="autoplay=1&rel=0&modestbranding=1"
                autoPlay
                muted
                controls
              />
           </div>
        </div>
      )}

    </div>
  );
}
