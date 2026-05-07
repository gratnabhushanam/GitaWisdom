import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Play, Star, Award, BookOpen, X, Sparkles, Heart } from 'lucide-react';
import MediaPlayerHLS from '../components/MediaPlayerHLS';

const FLOATING_KRISHNA = '/krishna-floating.svg';
const KRISHNA_MODAL_BACKGROUNDS = [
  '/scene-krishna.svg',
  '/krishna-line-art.svg',
  '/krishna-symbol.svg',
];
const SAMPLE_QUIZ = [
  {
    question: "What did Krishna teach about bravery?",
    options: ["To run away from problems", "To always be brave like Arjuna", "To never listen to elders", "To eat lots of butter!"],
    answer: 1,
    moral: "Always be brave like Arjuna!"
  },
  {
    question: "Who is Krishna's best friend in the stories?",
    options: ["Arjuna", "Hanuman", "Rama", "Sita"],
    answer: 0,
    moral: "Friendship is important!"
  }
];

export default function KidsMode() {
    // Card background color classes
    const colors = [
      'bg-gradient-to-br from-devotion-maroon/60 to-devotion-gold/10',
      'bg-gradient-to-br from-devotion-gold/20 to-devotion-maroon/30',
      'bg-gradient-to-br from-[#FFD70022] to-[#7A2E2E22]'
    ];
    const location = useLocation();
    const [videos, setVideos] = useState([]);
    const [, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

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
      // eslint-disable-next-line
      setLoading(true);
      axios.get('/api/videos/kids')
        .then(res => setVideos(Array.isArray(res.data) ? res.data : []))
        .catch(() => setVideos([]))
        .finally(() => setLoading(false));
    }, [location]);

    return (
      <>
        <div className="min-h-screen bg-[#020610] pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-white overflow-x-hidden relative">
          <style>{`
            @keyframes krishna-float {
              0% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-32px) scale(1.04); }
              100% { transform: translateY(0) scale(1); }
            }
            .animate-krishna-float {
              animation: krishna-float 4s ease-in-out infinite;
            }
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

          <div className="relative z-20 max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-devotion-gold/30 bg-devotion-gold/10 text-devotion-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /><span>Kids Mode</span></span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD700] to-white drop-shadow-[0_10px_30px_rgba(255,215,0,0.3)] mb-6 uppercase tracking-tight">
              Little Krishna
            </h1>
            <div className="inline-block relative">
              <p className="text-xl md:text-2xl text-gray-300 font-serif italic border-b border-devotion-gold/30 pb-4">
                Gentle stories, songs, and lessons for young hearts.
              </p>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="col-span-full bg-glass-gradient backdrop-blur-3xl p-16 rounded-[3rem] border border-devotion-gold/20 text-center shadow-2xl">
                <div className="text-7xl mb-6 opacity-30">🕉️</div>
                <p className="text-3xl font-serif text-devotion-gold mb-4">Stories are being prepared.</p>
                <p className="text-gray-300 text-lg font-light">Check back soon for new Krishna adventures for children.</p>
              </div>
            )}
          </div>
        </div>
        {/* Video Modal */}
        {selectedVideo && !showQuiz && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            setShowQuiz={setShowQuiz}
            setQuizResult={setQuizResult}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
        )}
        {showQuiz && selectedVideo && (
          <QuizModal
            onClose={() => { setShowQuiz(false); setSelectedVideo(null); }}
            setResult={setQuizResult}
          />
        )}
      </>
    );
}

function VideoModal({ video, onClose, setShowQuiz, setQuizResult, isFavorite, toggleFavorite }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-6 bg-[#06101E]/80 backdrop-blur-xl transition-all duration-300">
      <div className="bg-gradient-to-br from-[#FFE5B4] via-[#FFEBB0] to-[#FFF8DC] w-full max-w-[98vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] border-4 border-white/40 md:p-8 p-6 relative animate-fade-in-up shadow-[0_20px_100px_rgba(255,229,180,0.3)] overflow-hidden">
        {/* Subtle Krishna Background Image - warm overlay */}
        <div 
           className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none bg-cover bg-center bg-no-repeat Mix-blend-multiply" 
           style={{ backgroundImage: `url('/scene-krishna.svg')` }} 
        />
        {/* Radial warm glow */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_60%)]"></div>

        <div className="relative z-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-white/70 text-[#4A2E00] w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 border-white/50 hover:bg-white hover:text-red-500 hover:scale-105 transition-all active:scale-95 z-20 backdrop-blur-md shadow-xl"
            aria-label="Close"
          >
            <X />
          </button>

          {/* Cinematic Video Player */}
          <div className="w-full rounded-[2rem] overflow-hidden bg-[#4A2E00] mb-8 shadow-[0_20px_50px_rgba(74,46,0,0.2)] relative border-4 border-white mt-16 md:mt-0">
            <MediaPlayerHLS
              url={video.videoUrl || video.youtubeUrl || video.url}
              hlsUrl={video.hlsUrl}
              title={video.title}
              className="w-full aspect-video"
              autoPlay={true}
              shouldPlay={true}
              muted={false}
              loop={false}
              controls={true}
            />
          </div>

          {/* Title & Info */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#5C2B11] mb-4 drop-shadow-sm">
              {video.chapter ? `Chapter ${video.chapter}: ` : ''}{video.title}
            </h2>
            <p className="text-[#6D4224] text-xl font-medium leading-relaxed max-w-4xl">
              {video.description || "Join Krishna for a fun adventure!"}
            </p>
          </div>

          {/* Moral of the Story */}
          {video.moral && (
            <div className="bg-white/60 backdrop-blur-sm border-l-8 border-[#FF8C00] rounded-r-3xl p-6 mb-10 shadow-[0_10px_30px_rgba(255,140,0,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-8 h-8 text-[#FF8C00] fill-[#FF8C00] drop-shadow-md animate-pulse" />
                <h4 className="text-xl font-black text-[#8B4513] uppercase tracking-[0.2em]">Moral</h4>
              </div>
              <p className="text-[#A0522D] text-2xl font-serif font-bold italic drop-shadow-sm leading-relaxed">{video.moral}</p>
            </div>
          )}

          {/* Read Along Section */}
          {video.script && <ReadAlong script={video.script} />}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-5 items-center mt-8">
            <button
              onClick={() => {
                setQuizResult(null);
                setShowQuiz(true);
              }}
              className="bg-gradient-to-r from-[#FF8C00] to-[#FFA500] text-white px-10 py-4 rounded-full font-black text-lg uppercase tracking-[0.1em] flex items-center gap-3 shadow-[0_10px_30px_rgba(255,140,0,0.4)] hover:shadow-[0_15px_40px_rgba(255,140,0,0.6)] hover:scale-105 transition-all active:scale-95"
            >
              <Award className="w-7 h-7" /> Take Quiz!
            </button>
            <button
              className={`flex items-center gap-3 px-8 py-4 rounded-full border-4 font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isFavorite(video) ? 'border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] shadow-[0_10px_20px_rgba(255,69,0,0.2)]' : 'border-[#FF8C00]/30 bg-white/50 text-[#C65D00] hover:bg-white/80'}`}
              onClick={() => toggleFavorite(video)}
            >
              <Heart className={`w-6 h-6 ${isFavorite(video) ? 'fill-[#FF4500]' : 'fill-none stroke-current'}`} />
              {isFavorite(video) ? 'Saved' : 'Save to Favorites'}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-full border-4 border-transparent text-[#6D4224] bg-white/40 font-black text-sm uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all ml-auto hover:scale-105 shadow-sm"
            >
              Close
            </button>
          </div>
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
    <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 mb-12 relative">
      <div className="absolute -top-6 -left-6 bg-devotion-gold p-4 rounded-2xl rotate-12 shadow-lg">
        <BookOpen className="text-devotion-darkBlue w-8 h-8" />
      </div>
      <h4 className="text-xl font-black text-devotion-gold uppercase mb-6 tracking-[0.25em]">Read Along</h4>
      <p className="text-xl md:text-2xl text-gray-200 font-serif leading-relaxed italic select-none">
        {words.map((word, idx) =>
          word.trim() ? (
            <span
              key={idx}
              className={`cursor-pointer transition-all px-1 rounded ${highlighted.includes(idx) ? 'bg-devotion-gold/70 text-devotion-darkBlue font-black' : ''}`}
              onClick={() => handleWordClick(idx)}
            >
              {word}
            </span>
          ) : word
        )}
      </p>
      <div className="mt-4 text-xs text-devotion-gold/80">Tap words as you read to highlight them!</div>
    </div>
  );
}

function QuizModal({ onClose, setResult }) {
  const [quiz] = useState(() => SAMPLE_QUIZ[Math.floor(Math.random() * SAMPLE_QUIZ.length)]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const handleAnswer = (idx) => {
    setSelected(idx);
    setAnswered(true);
    setResult(idx === quiz.answer);
  };
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-md">
      <div className="bg-[#06101E] w-full max-w-2xl rounded-[2rem] border border-devotion-gold/30 p-10 relative animate-fade-in-up shadow-[0_0_80px_rgba(255,215,0,0.12)] text-center">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-devotion-gold/10 text-devotion-gold w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-devotion-gold/20 hover:bg-devotion-gold/20 transition-all hover:-translate-y-1 active:translate-y-1"
        >
          <X />
        </button>
        <h3 className="text-3xl font-black text-devotion-gold mb-8">Quiz Time!</h3>
        <div className="mb-8">
          <div className="text-xl md:text-2xl font-serif text-white mb-6">{quiz.question}</div>
          <div className="flex flex-col gap-4">
            {quiz.options.map((opt, idx) => (
              <button
                key={idx}
                className={`w-full py-4 rounded-xl border-2 font-black text-lg transition-all ${selected === idx ? (idx === quiz.answer ? 'bg-green-400/80 border-green-600 text-green-900' : 'bg-red-400/80 border-red-600 text-red-900') : 'bg-white/5 border-white/10 text-white hover:bg-devotion-gold/10 hover:border-devotion-gold/40 hover:text-devotion-gold'}`}
                disabled={answered}
                onClick={() => handleAnswer(idx)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        {answered && (
          <div className="mt-6 text-xl font-black">
            {selected === quiz.answer ? (
              <span className="text-green-400">Correct! 🎉</span>
            ) : (
              <span className="text-red-400">Oops! The right answer is: <span className="font-black text-devotion-gold">{quiz.options[quiz.answer]}</span></span>
            )}
          </div>
        )}
        {answered && (
          <button
            className="mt-8 bg-devotion-gold text-devotion-darkBlue px-10 py-4 rounded-full font-black text-lg uppercase tracking-[0.2em] shadow hover:brightness-110 transition-all"
            onClick={onClose}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}

function TeaserCard({ video, isFavorite, toggleFavorite, onSelect, index }) {
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
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '/krishna-line-art.svg');
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
            {video.description || "Join Krishna for a magical animated adventure!"}
          </p>

          <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 shadow-2xl ${isHovered ? 'bg-gradient-to-r from-devotion-gold to-[#FF9F1C] text-devotion-darkBlue scale-105' : 'bg-white/10 border border-white/20 text-white backdrop-blur-md'}`}>
            Watch Adventure
          </button>
        </div>
      </div>
    </div>
  );
}

