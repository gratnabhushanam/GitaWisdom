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
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [modalBgIndex, setModalBgIndex] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const consumedOpenVideoIdRef = useRef(null);
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
        <div className="min-h-screen bg-[#06101E] pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-white overflow-x-hidden relative">
          {/* Animated Krishna floating SVG */}
          <img
            src={FLOATING_KRISHNA}
            alt="Little Krishna floating"
            className="pointer-events-none select-none fixed left-[-80px] top-24 w-64 h-64 animate-krishna-float z-30 opacity-80"
            style={{ filter: 'drop-shadow(0 8px 32px #FFD70088)' }}
          />
          {/* Sparkle overlay */}
          <div className="pointer-events-none fixed inset-0 z-20 animate-sparkle-bg" />
          {/* Interactive radial background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(122,46,46,0.22),transparent_28%)]"></div>

          <div className="relative max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
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
            `}</style>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-devotion-gold/30 bg-devotion-gold/10 text-devotion-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /><span>Kids Mode</span></span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black text-devotion-gold drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] mb-6 uppercase tracking-tight">
              Little Krishna
            </h1>
            <div className="inline-block relative">
              <p className="text-xl md:text-2xl text-gray-300 font-serif italic border-b border-devotion-gold/30 pb-4">
                Gentle stories, songs, and lessons for young hearts.
              </p>
              <div className="absolute -right-12 -top-12 text-5xl opacity-60">ॐ</div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <div 
                key={video._id}
                className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl bg-gradient-to-br transition-all duration-500 transform hover:-translate-y-3 cursor-pointer group relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${colors[index % colors.length]}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="absolute -top-10 -right-10 text-white/10 text-[10rem] group-hover:rotate-12 transition-transform select-none">🕉️</div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-20 h-20 bg-devotion-gold/10 rounded-3xl flex items-center justify-center text-5xl mb-6 border border-devotion-gold/20 group-hover:scale-110 transition-transform rotate-3">
                    <Play className="w-10 h-10 text-devotion-gold fill-current ml-1" />
                  </div>
                  <h3 className="text-3xl font-serif font-black text-white mb-4 leading-tight drop-shadow-md">
                    Chapter {video.chapter}: {video.title}
                  </h3>
                  <p className="text-gray-300 font-light text-lg mb-8 line-clamp-2 leading-relaxed">
                    {video.description || "Join Krishna for a fun adventure!"}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <button className="bg-gradient-to-r from-devotion-gold to-[#FFB800] text-devotion-darkBlue px-8 py-3 rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_10px_30px_rgba(255,215,0,0.18)] group-hover:shadow-[0_14px_34px_rgba(255,215,0,0.24)] transition-all active:translate-y-1">
                      Watch Now <Play className="w-5 h-5 fill-current" />
                    </button>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${isFavorite(video) ? 'border-devotion-gold bg-devotion-gold/20 text-devotion-gold' : 'border-white/20 bg-white/5 text-white/60'} font-black text-xs uppercase tracking-widest transition-all hover:scale-105`}
                      title={isFavorite(video) ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={e => { e.stopPropagation(); toggleFavorite(video); }}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(video) ? 'fill-devotion-gold' : 'fill-none'}`} />
                      {isFavorite(video) ? 'Favorited' : 'Favorite'}
                    </button>
                  </div>
                </div>
              </div>
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
            modalBgIndex={modalBgIndex}
            setShowQuiz={setShowQuiz}
            setQuizResult={setQuizResult}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
        )}
        {showQuiz && selectedVideo && (
          <QuizModal
            video={selectedVideo}
            onClose={() => { setShowQuiz(false); setSelectedVideo(null); }}
            result={quizResult}
            setResult={setQuizResult}
          />
        )}
      </>
    );
}

function VideoModal({ video, onClose, modalBgIndex, setShowQuiz, setQuizResult, isFavorite, toggleFavorite }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-xl">
      <div className="bg-[#06101E] w-full max-w-[98vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto rounded-[2rem] border border-devotion-gold/20 md:p-8 p-4 relative animate-fade-in-up shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-devotion-gold/10 text-devotion-gold w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-devotion-gold/20 hover:bg-devotion-gold/20 transition-all hover:-translate-y-1 active:translate-y-1 z-10"
        >
          <X />
        </button>

        {/* Cinematic Video Player */}
        <div className="w-full rounded-[1.5rem] overflow-hidden bg-black mb-8 shadow-2xl relative">
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
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-serif font-black text-devotion-gold mb-3">
            {video.chapter ? `Chapter ${video.chapter}: ` : ''}{video.title}
          </h2>
          <p className="text-gray-300 text-lg font-light leading-relaxed">
            {video.description || "Join Krishna for a fun adventure!"}
          </p>
        </div>

        {/* Moral of the Story */}
        {video.moral && (
          <div className="bg-devotion-gold/10 border border-devotion-gold/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-6 h-6 text-devotion-gold fill-devotion-gold" />
              <h4 className="text-lg font-black text-devotion-gold uppercase tracking-[0.2em]">Moral</h4>
            </div>
            <p className="text-white text-lg font-serif italic">{video.moral}</p>
          </div>
        )}

        {/* Read Along Section */}
        {video.script && <ReadAlong script={video.script} />}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => {
              setQuizResult(null);
              setShowQuiz(true);
            }}
            className="bg-gradient-to-r from-devotion-gold to-[#FFB800] text-devotion-darkBlue px-8 py-3 rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_10px_30px_rgba(255,215,0,0.18)] hover:shadow-[0_14px_34px_rgba(255,215,0,0.24)] transition-all active:translate-y-1"
          >
            <Award className="w-5 h-5" /> Take Quiz
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-black text-sm uppercase tracking-widest transition-all hover:scale-105 ${isFavorite(video) ? 'border-devotion-gold bg-devotion-gold/20 text-devotion-gold' : 'border-white/20 bg-white/5 text-white/60'}`}
            onClick={() => toggleFavorite(video)}
          >
            <Heart className={`w-5 h-5 ${isFavorite(video) ? 'fill-devotion-gold' : 'fill-none'}`} />
            {isFavorite(video) ? 'Favorited' : 'Favorite'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-white/20 text-white/60 font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Close
          </button>
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

function QuizModal({ video, onClose, result, setResult }) {
  const quiz = SAMPLE_QUIZ[Math.floor(Math.random() * SAMPLE_QUIZ.length)];
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

