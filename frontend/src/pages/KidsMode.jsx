import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Star, BookOpen, X, Sparkles, Heart, BrainCircuit, Maximize, ChevronRight } from 'lucide-react';
import MediaPlayerHLS from '../components/MediaPlayerHLS';

const FLOATING_KRISHNA = '/krishna-floating.svg';

export default function KidsMode() {
    const location = useLocation();
    const [videos, setVideos] = useState([]);
    const [, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Favorites state (localStorage)
    const [favorites, setFavorites] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem('kidsFavorites') || '[]');
      } catch {
        return [];
      }
    });

    const isFavorite = (video) => favorites.includes(video._id || video.id);
    const toggleFavorite = (video) => {
      const id = video._id || video.id;
      setFavorites((prev) => {
        let updated;
        if (prev.includes(id)) {
          updated = prev.filter(favId => favId !== id);
        } else {
          updated = [...prev, id];
        }
        localStorage.setItem('kidsFavorites', JSON.stringify(updated));
        return updated;
      });
    };

    // Fetch videos
    useEffect(() => {
      setLoading(true);
      axios.get('/api/videos/kids')
        .then(res => setVideos(Array.isArray(res.data) ? res.data : []))
        .catch(() => setVideos([]))
        .finally(() => setLoading(false));
    }, [location]);

    return (
      <>
        <div className="min-h-screen bg-[#020610] pt-16 landscape:pt-14 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-white overflow-x-hidden relative pl-safe pr-safe">
          <style>{`
            @keyframes krishna-float { 0%{transform:translateY(0) scale(1)} 50%{transform:translateY(-32px) scale(1.04)} 100%{transform:translateY(0) scale(1)} }
            .animate-krishna-float { animation: krishna-float 4s ease-in-out infinite; }
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
            .light-streak { position:absolute;width:300px;height:2px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.6),transparent);animation:float-streak 8s linear infinite;filter:blur(4px);pointer-events:none; }
            @media (orientation:landscape) and (max-width:1024px) {
              .kids-landscape-header { display:none !important; }
              .kids-landscape-mini { display:flex !important; }
              .kids-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            }
            .kids-landscape-mini { display:none; }
          `}</style>

          {/* Background Layers */}
          <div className="absolute inset-0 bg-[#020610] z-0"></div>
          <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,159,28,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,50,100,0.4),transparent_50%)]"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.03]">
             <span className="text-[60vw] font-black text-white mix-blend-overlay">ॐ</span>
          </div>

          {/* Sparkles & Particles */}
          <div className="pointer-events-none absolute inset-0 z-10 animate-sparkle-bg" />
          <div className="light-streak" style={{ top: '80%', left: '-10%', animationDelay: '0s' }}></div>
          <div className="light-streak" style={{ top: '40%', left: '-20%', animationDelay: '3s' }}></div>

          {/* Header - Portrait/Desktop */}
          <div className="kids-landscape-header relative z-20 max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-devotion-gold/30 bg-devotion-gold/10 text-devotion-gold text-[10px] font-black tracking-[0.4em] uppercase mb-8 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
              <Sparkles className="w-4 h-4" /> Little Krishna Mode
            </div>
            <h1 className="text-5xl md:text-9xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD700] to-white drop-shadow-[0_10px_30px_rgba(255,215,0,0.3)] mb-6 uppercase tracking-tight leading-none">
               Divine <span className="italic font-light tracking-normal opacity-90">Kids</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-serif italic max-w-2xl mx-auto">
              "Gentle stories and lessons to guide young hearts with wisdom and joy."
            </p>
          </div>

          {/* Header - Landscape Mini */}
          <div className="kids-landscape-mini items-center gap-3 mb-6 relative z-20 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 sticky top-2">
            <Sparkles className="w-4 h-4 text-devotion-gold" />
            <span className="text-devotion-gold font-black text-sm uppercase tracking-widest">Little Krishna</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-white/50 text-[10px] font-bold uppercase">{videos.length} stories found</span>
          </div>

          {/* Video Grid */}
          <div className="kids-grid relative max-w-[1920px] mx-auto grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 pb-20">
            {videos.map((video, index) => (
              <TeaserCard
                key={video._id || video.id || index}
                video={video}
                index={index}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                onSelect={setSelectedVideo}
              />
            ))}
            {videos.length === 0 && (
              <div className="col-span-full bg-glass-gradient backdrop-blur-3xl p-24 rounded-[3rem] border border-devotion-gold/20 text-center shadow-2xl">
                <Sparkles className="w-16 h-16 text-devotion-gold mx-auto mb-8 opacity-30 animate-pulse" />
                <p className="text-3xl font-serif text-devotion-gold mb-4">Magical stories are being prepared.</p>
                <p className="text-gray-300 text-lg font-light">Krishna is gathering new adventures for you. Check back soon!</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
        )}
      </>
    );
}

function VideoModal({ video, onClose, isFavorite, toggleFavorite }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  if (!video) return null;

  const handleTakeQuiz = () => {
    onClose();
    navigate(video.quizSetId ? `/quiz?setId=${video.quizSetId}` : '/quizzes');
  };

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
    <div className="fixed inset-0 z-[70] bg-[#06101E]/98 backdrop-blur-2xl flex flex-col overflow-y-auto pl-safe pr-safe">
      <button onClick={onClose} className="fixed top-4 right-4 z-[80] bg-black/60 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500/40 transition-all active:scale-90 shadow-2xl">
        <X className="w-5 h-5" />
      </button>

      {/* Video - Sticky Top */}
      <div ref={videoRef} className="relative w-full bg-black flex-shrink-0 z-10 shadow-[0_10px_60px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto w-full aspect-video">
          <MediaPlayerHLS
            url={video.videoUrl || video.youtubeUrl || video.url}
            hlsUrl={video.hlsUrl}
            title={video.title}
            className="w-full h-full"
            autoPlay={true}
            controls={true}
          />
        </div>
        <button onClick={handleFullscreen} className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 hover:bg-devotion-gold/20 hover:border-devotion-gold/50 transition-all z-20 active:scale-95 shadow-xl">
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Details - REFINED BACKGROUND & REDUCED CARD WIDTH */}
      <div className="w-full min-h-screen bg-[#FFFBF0] p-6 md:p-12 relative overflow-hidden">
        {/* Playful Background Elements */}
        <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-cover bg-center" style={{ backgroundImage: `url('/scene-krishna.svg')` }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-devotion-gold/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-10">
          
          <div className="border-b border-[#5C2B11]/10 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#FF8C00] text-white px-4 py-1.5 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-lg">KIDS SPECIAL</span>
              {video.chapter && <span className="text-[#8B4513] font-black text-[10px] uppercase tracking-widest bg-white/50 px-3 py-1 rounded-lg">VOLUME {video.chapter}</span>}
            </div>
            <h2 className="text-4xl md:text-7xl font-serif font-black text-[#5C2B11] mb-6 drop-shadow-sm tracking-tight leading-tight uppercase">
              {video.title}
            </h2>
            <p className="text-[#6D4224] text-xl md:text-3xl font-serif italic leading-relaxed opacity-90 max-w-3xl border-l-4 border-[#FF8C00] pl-6">
              {video.description || 'Join Krishna for a magical animated adventure!'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button onClick={handleTakeQuiz} className="flex-1 sm:flex-none min-w-[240px] bg-gradient-to-r from-[#FF8C00] to-[#FFA500] text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,140,0,0.4)] hover:scale-[1.03] transition-all active:scale-95">
              <BrainCircuit className="w-8 h-8" /> PLAY QUIZ!
            </button>
            <button onClick={() => toggleFavorite(video)} className={`flex-1 sm:flex-none min-w-[240px] flex items-center justify-center gap-4 px-8 py-5 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-95 ${isFavorite(video) ? 'border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500]' : 'border-[#FF8C00]/40 bg-white/60 text-[#C65D00] hover:bg-white/90 shadow-xl'}`}>
              <Heart className={`w-8 h-8 ${isFavorite(video) ? 'fill-[#FF4500]' : 'fill-none'}`} />
              {isFavorite(video) ? 'SAVED TO HEART' : 'ADD TO FAVORITES'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            <div className="space-y-8">
              {video.moral && (
                <div className="bg-white/90 backdrop-blur-md border-l-8 border-[#FF8C00] rounded-[2.5rem] p-10 shadow-2xl transform hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-4 mb-6">
                    <Star className="w-10 h-10 text-[#FF8C00] fill-[#FF8C00] animate-pulse" />
                    <span className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.4em]">The Moral Lesson</span>
                  </div>
                  <p className="text-[#A0522D] text-3xl md:text-5xl font-serif font-black italic leading-tight text-center md:text-left drop-shadow-sm">{video.moral}</p>
                </div>
              )}

              <div className="bg-white/70 backdrop-blur-md border border-[#FFB347]/30 rounded-[3rem] p-10 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-[#FF8C00]/20 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-[#FF8C00]" />
                  </div>
                  <span className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.3em]">Knowledge Gained</span>
                </div>
                <ul className="space-y-6">
                  {[
                    video.lesson1 || "Krishna's divine stories and teachings",
                    video.lesson2 || 'The power of devotion and righteousness',
                    video.lesson3 || 'Life lessons from the Bhagavad Gita',
                  ].map((lesson, i) => (
                    <li key={i} className="flex items-center gap-6 group">
                      <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8C00] to-[#FFA500] text-white flex items-center justify-center font-black text-sm shadow-xl group-hover:scale-110 transition-transform">
                        {i + 1}
                      </span>
                      <span className="text-lg md:text-xl text-[#6D4224] font-bold leading-tight group-hover:text-[#5C2B11] transition-colors">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-[3rem] border border-[#FF8C00]/20 p-10 flex items-center gap-8 shadow-2xl relative overflow-hidden group cursor-pointer" onClick={handleTakeQuiz}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-devotion-gold/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF8C00] to-[#FF4500] flex items-center justify-center flex-shrink-0 shadow-2xl relative z-10 group-hover:rotate-12 transition-transform">
                  <BrainCircuit className="w-12 h-12 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.4em] mb-2">Interactive Wisdom</p>
                  <p className="text-3xl font-black text-[#5C2B11] leading-none mb-2">QUIZ TIME!</p>
                  <p className="text-sm font-bold text-[#A0522D] uppercase tracking-widest">Earn 100+ Karma Points</p>
                </div>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className="bg-white/60 p-10 rounded-[3rem] border border-[#FF8C00]/10 shadow-lg">
                  <p className="text-[10px] font-black text-[#8B4513] uppercase tracking-[0.3em] mb-8">Discovery Topics</p>
                  <div className="flex flex-wrap gap-3">
                    {video.tags.map((tag, i) => (
                      <span key={i} className="bg-white px-6 py-3 rounded-2xl border border-[#FF8C00]/20 text-[#A0522D] text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-[#FF8C00] hover:bg-[#FF8C00] hover:text-white hover:scale-105 transition-all cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {video.script && (
            <div className="pt-20">
              <ReadAlong script={video.script} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadAlong({ script }) {
  const [highlighted, setHighlighted] = useState([]);
  const words = script.split(/(\s+)/);
  const handleWordClick = (idx) => {
    setHighlighted((prev) => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };
  return (
    <div className="bg-white/80 backdrop-blur-xl p-12 md:p-20 rounded-[4rem] border border-white shadow-2xl relative mb-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-devotion-gold/10 rounded-full blur-3xl -mr-40 -mt-40" />
      <div className="absolute -top-6 -left-6 bg-[#FF8C00] p-6 rounded-[2rem] rotate-12 shadow-2xl z-10 border-4 border-white">
        <BookOpen className="text-white w-12 h-12" />
      </div>
      <h4 className="text-2xl font-black text-[#5C2B11] uppercase mb-12 tracking-[0.3em] text-center md:text-left">Read Along Journey</h4>
      <p className="text-2xl md:text-5xl text-[#5C2B11] font-serif leading-relaxed italic select-none text-center md:text-left drop-shadow-sm">
        {words.map((word, idx) =>
          word.trim() ? (
            <span
              key={idx}
              className={`cursor-pointer transition-all px-2 py-1 rounded-2xl ${highlighted.includes(idx) ? 'bg-[#FF8C00] text-white font-black shadow-lg scale-110 inline-block rotate-1' : 'hover:bg-[#FF8C00]/10'}`}
              onClick={() => handleWordClick(idx)}
            >
              {word}
            </span>
          ) : word
        )}
      </p>
      <div className="mt-12 text-xs font-black text-[#8B4513] uppercase tracking-[0.3em] text-center md:text-left opacity-40 italic">Tap words to follow the adventure!</div>
    </div>
  );
}

function TeaserCard({ video, isFavorite, toggleFavorite, onSelect, index }) {
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
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '/krishna-line-art.svg');
  const isNew = index < 2;

  return (
    <div
      className="relative cursor-pointer group rounded-[3rem] overflow-hidden shadow-2xl border border-devotion-gold/20
                 h-[340px] landscape:h-[220px] sm:h-[420px] md:h-[520px] md:landscape:h-[520px]
                 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,215,0,0.25)]"
      onClick={() => onSelect(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-devotion-gold via-[#FF9F1C] to-devotion-gold rounded-[3rem] blur-lg transition-opacity duration-500 pointer-events-none" style={{ opacity: isHovered ? 0.6 : 0 }}></div>
      
      <div className="relative h-full w-full bg-[#0A1A2F] rounded-[3rem] border border-devotion-gold/30 overflow-hidden shadow-2xl flex flex-col">
        <div className="absolute inset-0 z-0 bg-black">
          <img src={thumbUrl} alt={video.title} className={`w-full h-full object-cover opacity-80 transition-transform duration-1000 ${isHovered ? 'scale-110' : 'scale-100'}`} />
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#06101E] via-[#06101E]/60 to-transparent z-20 group-hover:via-[#06101E]/40 transition-all duration-500"></div>
        </div>

        <div className="absolute top-6 left-0 right-0 px-6 z-30 flex justify-between items-center">
          <div className="flex gap-2">
            {isNew && <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg animate-pulse">New</span>}
          </div>
          <button
            className={`flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-xl transition-all active:scale-90 ${isFavorite(video) ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-black/40 text-white/80 border border-white/20 hover:bg-white/20'}`}
            onClick={e => { e.stopPropagation(); toggleFavorite(video); }}
          >
            <Heart className={`w-6 h-6 ${isFavorite(video) ? 'fill-red-500' : 'fill-none'}`} />
          </button>
        </div>

        <div className="mt-auto p-8 landscape:p-4 md:landscape:p-8 relative z-30 flex flex-col items-center text-center">
          <div className={`w-16 h-16 landscape:w-10 landscape:h-10 md:landscape:w-16 md:landscape:h-16 bg-devotion-gold/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-devotion-gold/40 mb-6 landscape:mb-2 md:landscape:mb-6 transition-all duration-500 ${isHovered ? 'scale-110 bg-devotion-gold text-[#0A1A2F] shadow-[0_0_50px_rgba(255,215,0,0.5)]' : 'text-devotion-gold'}`}>
             <Play className="w-8 h-8 landscape:w-5 landscape:h-5 md:landscape:w-8 md:landscape:h-8 ml-1 fill-current" />
          </div>
          
          <h3 className="text-2xl md:text-4xl landscape:text-lg md:landscape:text-4xl font-serif font-black text-white mb-3 landscape:mb-1 md:landscape:mb-3 leading-none drop-shadow-2xl tracking-tighter uppercase">
            {video.title}
          </h3>
          
          <p className="text-gray-300 font-serif italic text-sm landscape:hidden md:landscape:block mb-8 md:landscape:mb-8 line-clamp-2 opacity-80 leading-tight">
            {video.description || "Join Krishna for a magical animated adventure!"}
          </p>

          <button className={`w-full py-4 landscape:py-2 md:landscape:py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 shadow-2xl ${isHovered ? 'bg-gradient-to-r from-devotion-gold to-[#FF9F1C] text-[#0A1A2F] scale-105' : 'bg-white/10 border border-white/20 text-white backdrop-blur-md'}`}>
            BEGIN ADVENTURE
          </button>
        </div>
      </div>
    </div>
  );
}
