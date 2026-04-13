import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Flame, Trophy, Award, ArrowRight, Book, Sparkles, Star, Heart } from 'lucide-react';

const HOME_BACKGROUND_SCENES = [
  '/scene-krishna.svg',
  '/scene-ram.svg',
  '/scene-hanuman.svg',
];

export default function Home() {
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HOME_BACKGROUND_SCENES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {HOME_BACKGROUND_SCENES.map((scene, index) => (
        <div
          key={scene}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${scene}')` }}
          aria-hidden="true"
        />
      ))}

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(6,16,30,0.5),rgba(6,16,30,0.72)),radial-gradient(circle_at_top,rgba(230,195,138,0.12),transparent_34%)]"></div>
      
      {/* Hero Section */}
        <div className="relative z-10 min-h-[80vh] sm:min-h-[85vh] flex flex-col items-center justify-center pt-20 sm:pt-28 pb-6 sm:pb-10 px-4">
        
        {/* Krishna Line Art Decorative Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-[0.02] pointer-events-none select-none animate-float">
           <img src="/krishna-line-art.svg" alt="Krishna Line Art" className="w-full h-auto" />
        </div>

        {/* Streak Counter if logged in */}
        {user && (
          <div className="relative z-20 mb-6 sm:mb-12 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-glass-gradient backdrop-blur-xl px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-full border border-devotion-gold/30 animate-fade-in-down shadow-[0_0_30px_rgba(255,215,0,0.1)] w-full sm:w-auto justify-center">
             <div className="bg-orange-500/20 p-2.5 rounded-full relative">
                <Flame className="w-7 h-7 text-orange-500" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                </span>
             </div>
             <div className="pr-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-devotion-textYellow/70 leading-none">Spiritual Path</p>
                <p className="text-2xl font-black text-devotion-gold leading-none mt-1.5">{user.streak || 0} DAY STREAK 🔥</p>
             </div>
             <div className="h-10 w-px bg-devotion-gold/20 mx-2"></div>
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-devotion-gold/20 flex items-center justify-center border border-devotion-gold/50 shadow-xl backdrop-blur-md transform hover:scale-110 transition-transform cursor-pointer"><Trophy className="w-5 h-5 text-devotion-gold" /></div>
                <div className="w-10 h-10 rounded-full bg-devotion-darkBlue/40 flex items-center justify-center border border-white/10 shadow-lg transform hover:scale-110 transition-transform cursor-pointer"><Award className="w-5 h-5 text-gray-400" /></div>
             </div>
          </div>
        )}
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-devotion-gold/40 bg-devotion-gold/5 backdrop-blur-xl mb-2 text-devotion-gold text-xs font-black tracking-[0.3em] shadow-[0_0_25px_rgba(255,215,0,0.15)] uppercase">
            <span className="w-2 h-2 rounded-full bg-devotion-gold animate-pulse"></span>
            Divine Wisdom for Modern Minds
          </div>
        
          <h1 className="text-6xl md:text-9xl font-serif font-black text-devotion-gold drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tighter leading-tight">
            Gita <span className="text-white opacity-90 italic font-light drop-shadow-none tracking-normal">Wisdom</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-serif italic">
            "Whenever dharma declines and adharma rises, I manifest Myself."
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <Link to="/stories" className="group bg-gradient-to-br from-devotion-gold via-[#FFB800] to-[#FF9F1C] text-devotion-darkBlue px-10 py-5 rounded-2xl font-black text-xl transition-all duration-500 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transform hover:-translate-y-1.5 flex items-center justify-center gap-3 active:scale-95">
              START LEARNING
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/reels" className="group bg-devotion-darkBlue/40 backdrop-blur-2xl border border-devotion-gold/40 text-white hover:bg-devotion-darkBlue/70 hover:border-devotion-gold px-10 py-5 rounded-2xl font-black text-xl transition-all duration-500 flex items-center justify-center gap-3 transform hover:-translate-y-1.5 active:scale-95 shadow-2xl">
              <Play className="w-6 h-6 text-devotion-gold transition-transform group-hover:scale-125" fill="currentColor" />
              GITA REELS
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Sections (Card Match) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 relative z-10">
        
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-6 mb-20 opacity-40">
           <div className="h-px w-24 bg-gradient-to-r from-transparent to-devotion-gold"></div>
           <Sparkles className="text-devotion-gold w-6 h-6" />
           <div className="h-px w-24 bg-gradient-to-l from-transparent to-devotion-gold"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          
          {/* Daily Quick Guide / Sloka styling */}
          <Link to="/sloka" className="block group">
            <div className="bg-glass-gradient backdrop-blur-3xl rounded-[2.5rem] p-10 border border-devotion-gold/30 shadow-2xl relative h-full transition-all duration-500 hover:-translate-y-3 hover:border-devotion-gold/60 group-hover:shadow-[0_20px_60px_rgba(255,215,0,0.15)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-devotion-gold to-[#FFB800] text-devotion-darkBlue px-8 py-2 rounded-full font-black text-xs tracking-[0.2em] shadow-xl uppercase">
                DAILY SLOKA
              </div>
              <div className="mt-6 text-center">
                <div className="w-20 h-20 mx-auto bg-devotion-gold/10 rounded-full flex items-center justify-center mb-8 border border-devotion-gold/20 group-hover:scale-110 transition-transform">
                  <Book className="w-10 h-10 text-devotion-gold" />
                </div>
                <p className="text-gray-200 font-serif leading-relaxed text-xl mb-8 italic opacity-90">
                  "You have a right to perform your duty, but not to the fruits."
                </p>
                <div className="text-devotion-gold font-black text-xs tracking-widest border-b-2 border-devotion-gold/0 group-hover:border-devotion-gold/100 inline-block pb-1 transition-all">
                  EXPLORE WISDOM
                </div>
              </div>
            </div>
          </Link>

          {/* Student Guide style */}
          <Link to="/mentor" className="block group">
            <div className="bg-glass-gradient backdrop-blur-3xl rounded-[2.5rem] p-10 border border-devotion-gold/30 shadow-2xl relative h-full transition-all duration-500 hover:-translate-y-3 hover:border-devotion-gold/60 group-hover:shadow-[0_20px_60px_rgba(255,215,0,0.15)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-devotion-gold to-[#FFB800] text-devotion-darkBlue px-8 py-2 rounded-full font-black text-xs tracking-[0.2em] shadow-xl uppercase">
                GITA MENTOR
              </div>
              <div className="mt-6 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-devotion-gold/10 rounded-full flex items-center justify-center mb-8 border border-devotion-gold/20 group-hover:scale-110 transition-transform">
                  <Heart className="w-10 h-10 text-devotion-gold" />
                </div>
                <h3 className="text-3xl font-serif font-black text-devotion-gold mb-4 uppercase tracking-tighter">Student Mode</h3>
                <p className="text-gray-300 text-lg font-light leading-relaxed">Krishna's solutions for stress, fear, and focus.</p>
              </div>
            </div>
          </Link>

          {/* Kids Mode style */}
          <Link to="/kids" className="block group">
            <div className="bg-glass-gradient backdrop-blur-3xl rounded-[2.5rem] p-10 border border-devotion-gold/30 shadow-2xl relative h-full transition-all duration-500 hover:-translate-y-3 hover:border-devotion-gold/60 group-hover:shadow-[0_20px_60px_rgba(255,215,0,0.15)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-devotion-gold to-[#FFB800] text-devotion-darkBlue px-8 py-2 rounded-full font-black text-xs tracking-[0.2em] shadow-xl uppercase">
                KIDS FUN!
              </div>
              <div className="mt-6 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-devotion-gold/10 rounded-full flex items-center justify-center mb-8 border border-devotion-gold/20 group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-devotion-gold" fill="currentColor" />
                </div>
                <h3 className="text-3xl font-serif font-black text-devotion-gold mb-4 uppercase tracking-tighter">Animated Stories</h3>
                <p className="text-gray-300 text-lg font-light leading-relaxed">Watch & Learn with Krishna! Cartoon adventures for little heroes.</p>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
