import React, { useEffect, useCallback } from 'react';
import { Music, PlusCircle, Bookmark, Volume2, VolumeX, Play, Pause, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import MediaPlayerHLS from '../components/MediaPlayerHLS';
import { useReels } from '../hooks/useReels';

const REELS_BACKGROUND_SCENES = [
  '/scene-krishna.svg',
  '/scene-ram.svg',
  '/scene-hanuman.svg',
];

export default function Reels() {
  const {
    user,
    reels,
    pendingReels,
    loading,
    error,
    commentInputs,
    setCommentInputs,
    submittingCommentId,
    moderatingId,
    bgIndex,
    expandedCommentReel,
    setExpandedCommentReel,
    savedReelMap,
    selectedCommentProfile,
    setSelectedCommentProfile,
    activeReelId,
    soundEnabled,
    setSoundEnabled,
    likePopReelId,
    pausedReelId,
    reelsFeedRef,
    canViewCommenterProfile,
    handleToggleLike,
    handleShare,
    handleCommentSubmit,
    handleDeleteComment,
    handleModeration,
    handleSaveReel,
    setActiveReelId,
    setPausedReelId,
    handleVideoSurfaceTap
  } = useReels();

  // Desktop Navigation & IntersectionObserver Setup
  const scrollToReel = useCallback((index) => {
    if (!reelsFeedRef.current || !reels || index < 0 || index >= reels.length) return;
    const target = reelsFeedRef.current.children[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [reels, reelsFeedRef]);

  useEffect(() => {
    const container = reelsFeedRef.current;
    if (!container || !reels.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            const reel = reels[index];
            if (reel) {
               const nextActiveId = String(reel._id || reel.id || '');
               if (nextActiveId !== activeReelId) {
                  setActiveReelId(nextActiveId);
                  setPausedReelId('');
               }
            }
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [reels, activeReelId, setActiveReelId, setPausedReelId, reelsFeedRef]);

  useEffect(() => {
    const container = reelsFeedRef.current;
    if (!container || !reels.length) return;

    let wheelTimeout;
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 20) {
        e.preventDefault();
        if (wheelTimeout) return;
        const activeIndex = reels.findIndex(r => String(r._id || r.id) === activeReelId);
        if (e.deltaY > 0) scrollToReel(activeIndex + 1);
        else scrollToReel(activeIndex - 1);
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);
      }
    };

    const handleKeyDown = (e) => {
      const activeIndex = reels.findIndex(r => String(r._id || r.id) === activeReelId);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToReel(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToReel(activeIndex - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [reels, activeReelId, scrollToReel, reelsFeedRef]);

  if (loading) return (
    <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#D39A4A] shadow-[0_0_20px_rgba(211,154,74,0.3)]"></div>
        <p className="text-[#D39A4A] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Entering Divine Reels...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="h-[100dvh] w-full bg-[#050B14] flex flex-col items-center justify-center text-center px-8">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-8">
          <Play className="w-10 h-10 text-red-500/40 rotate-45" />
        </div>
        <div className="text-xl font-bold text-white mb-4 uppercase tracking-tighter">{error}</div>
        <p className="text-gray-400 text-sm mb-10 max-w-xs leading-relaxed italic">The divine flow was interrupted. Please check your connection and try again.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link to="/login" className="px-8 py-4 rounded-2xl bg-devotion-gold text-[#050B14] font-black text-xs uppercase tracking-widest shadow-xl transition-transform active:scale-95">Go to Login</Link>
          <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-2xl border border-white/10 text-white font-black text-xs uppercase tracking-widest active:scale-95">Retry Sync</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative overflow-hidden overscroll-none">
      
      {/* Background Decor */}{REELS_BACKGROUND_SCENES.map((image, index) => (
        <div
          key={image}
          className={`fixed inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${image}')` }}
          aria-hidden="true"
        />
      ))}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(211,154,74,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(69,129,163,0.25),transparent_36%),linear-gradient(to_bottom,rgba(4,16,33,0.78),rgba(7,12,24,0.85))] backdrop-blur-[1px]" />

      <div className="w-full h-full relative z-10 flex flex-col">
        
        {/* Fixed Top Header */}
        <div className="fixed top-0 left-0 w-full z-[120] md:max-w-[420px] md:left-1/2 md:-translate-x-1/2">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <h1 className="text-lg font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">Divine Reels</h1>
            <Link to="/upload-reel" className="flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full p-2.5 border border-white/20 hover:bg-white/10 transition-colors shadow-lg">
               <PlusCircle className="w-6 h-6 text-white" />
            </Link>
          </div>
        </div>

      <div ref={reelsFeedRef} data-reels-feed="true" className="flex-1 w-full md:max-w-[420px] landscape:max-w-none mx-auto relative z-10 bg-black md:border-x md:border-white/10 landscape:border-0 snap-y snap-mandatory overflow-y-scroll no-scrollbar scroll-smooth pb-16 md:pb-0 landscape:pb-0 overscroll-none">
        
        {reels.length > 0 ? reels.map((reel, index) => {
          const reelId = String(reel._id || reel.id || '');
          const isActive = reelId === activeReelId;
          const isPausedByTap = pausedReelId === reelId;
          const shouldPlay = isActive && !isPausedByTap;

          const activeIndex = reels.findIndex(r => String(r._id || r.id) === activeReelId);
          const distance = Math.abs(index - activeIndex);
          const shouldRenderVideo = distance <= 2;

          const handleVideoEnd = () => {
            const currentVideoId = String(reel._id || reel.id);
            window.location.href = `/quiz?videoId=${currentVideoId}`;
          };

          return (
          <div key={reelId} data-index={index} className="h-full min-h-[100dvh] w-full relative snap-center flex flex-col justify-end bg-black overflow-hidden">

            {/* Background Video */}
            <div className="absolute inset-0 z-0">
               <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-black/20 absolute z-10 pointer-events-none"></div>
               {shouldRenderVideo ? (
                 <MediaPlayerHLS
                   url={reel.videoUrl || reel.youtubeUrl || reel.url}
                   hlsUrl={reel.hlsUrl}
                   title={reel.title}
                   className="w-full h-full object-cover"
                   youtubeParams={`autoplay=${shouldPlay ? 1 : 0}&mute=${shouldPlay && soundEnabled ? 0 : 1}&controls=0&loop=1&playsinline=1`}
                   autoPlay={shouldPlay}
                   shouldPlay={shouldPlay}
                   muted={!shouldPlay || !soundEnabled}
                   loop={false}
                   controls={false}
                   instagramMode={true}
                   onEnded={handleVideoEnd}
                   preload={distance === 0 ? "auto" : "metadata"}
                 />
               ) : (
                 <div className="w-full h-full bg-[#050B14] flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-devotion-gold/20 border-t-devotion-gold rounded-full animate-spin"></div>
                    </div>
                 </div>
               )}
            </div>

            <button
              type="button"
              onPointerUp={() => handleVideoSurfaceTap(reel, reelId)}
              className="absolute inset-0 z-[15]"
              aria-label={shouldPlay ? 'Pause reel' : 'Play reel'}
            />

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`absolute top-24 right-4 z-[25] w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform hover:scale-105 ${soundEnabled ? 'bg-[#D39A4A]/35 border-[#E6C38A]/60 text-[#E6C38A]' : 'bg-black/45 border-white/30 text-white'}`}
              aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {isPausedByTap && isActive && (
              <div className="absolute inset-0 z-[22] pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/55 border border-white/40 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}

            {likePopReelId === reelId && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <img
                  src="/hanuman-symbol.svg"
                  alt="Hanuman Blessing"
                  className="w-28 h-28 md:w-32 md:h-32 object-contain animate-fade-in-up drop-shadow-[0_0_35px_rgba(255,215,0,0.75)]"
                />
              </div>
            )}

            {/* Overlays */}
            <div className="relative z-20 px-4 flex justify-between items-end pb-[100px] md:pb-8 landscape:pb-4 w-full pointer-events-none landscape:px-12">
               
               <div className="flex-1 pr-4 drop-shadow-lg pointer-events-auto">
                 <h2 className="text-xl font-bold mb-2 text-white">{reel.title}</h2>
                 <p className="text-sm font-light line-clamp-2 text-gray-200">{reel.description || 'Gita wisdom in 60 seconds.'}</p>
                 <div className="flex items-center gap-2 mt-4 text-[#E6C38A]">
                    <Music className="w-4 h-4 animate-pulse" />
                    <marquee className="text-xs font-bold w-40">Lord Krishna Wisdom • Original Audio • Gita Mentor</marquee>
                 </div>
                 <div className="flex gap-2 mt-3">
                    {Array.isArray(reel.tags) && reel.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-[#1A3552]/65 border border-[#65B4D6]/30 backdrop-blur-md text-[#9FD9F0] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        #{tag}
                      </span>
                    ))}
                 </div>
               </div>

               <div className="flex flex-col landscape:flex-row gap-6 landscape:gap-4 items-center shrink-0 w-12 landscape:w-auto pointer-events-auto">
                 <button className="flex flex-col items-center gap-1 group" onClick={() => handleToggleLike(reel)}>
                   <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md hover:bg-red-500/20 transition-all transform hover:scale-110">
                     <img src="/ram-symbol.svg" alt="Like" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
                   </div>
                   <span className="text-[9px] uppercase tracking-[0.18em] text-[#E6C38A] font-black">Like</span>
                   <span className="text-xs font-bold">{reel.likesCount || 0}</span>
                 </button>
                 
                 <button
                   className="flex flex-col items-center gap-1 group"
                   onClick={() => {
                     const id = reel._id || reel.id;
                     setExpandedCommentReel((prev) => (prev === id ? null : id));
                   }}
                 >
                   <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transform hover:scale-110">
                     <img src="/krishna-symbol.svg" alt="Comment" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
                   </div>
                   <span className="text-[9px] uppercase tracking-[0.16em] text-[#E6C38A] font-black">Comment</span>
                   <span className="text-xs font-bold">{reel.commentsCount || 0}</span>
                 </button>

                 <button className="flex flex-col items-center gap-1 group" onClick={() => handleShare(reel)}>
                   <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transform hover:scale-110">
                     <img src="/hanuman-symbol.svg" alt="Share" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
                   </div>
                   <span className="text-[9px] uppercase tracking-[0.16em] text-[#E6C38A] font-black">Share</span>
                   <span className="text-xs font-bold">{reel.sharesCount || 0}</span>
                 </button>

                 <button className="flex flex-col items-center gap-1 group" onClick={() => handleSaveReel(reel)}>
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transform hover:scale-110 ${savedReelMap[String(reel._id || reel.id)] ? 'bg-[#D39A4A]/30 border border-[#E6C38A]/50' : 'bg-white/10'}`}>
                     <Bookmark className={`w-5 h-5 ${savedReelMap[String(reel._id || reel.id)] ? 'text-[#E6C38A]' : 'text-white'}`} />
                   </div>
                   <span className="text-[9px] uppercase tracking-[0.16em] text-[#E6C38A] font-black">{savedReelMap[String(reel._id || reel.id)] ? 'Saved' : 'Save'}</span>
                 </button>
               </div>

            </div>

          </div>
        );}) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-12">
            <Play className="w-16 h-16 text-gray-800 mb-6 opacity-20" />
            <p className="text-xl font-serif italic text-gray-500">Divine reels are currently being synchronized.</p>
            <p className="text-gray-600 text-xs mt-4">Check back in a moment for a spiritual journey.</p>
          </div>
        )}
        </div>

        {expandedCommentReel && (
          <div 
            className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-sm animate-fade-in" 
            onClick={() => setExpandedCommentReel(null)}
          />
        )}

        <div 
          className={`fixed bottom-0 left-0 w-full md:max-w-[420px] md:left-1/2 md:-translate-x-1/2 bg-[#0b1220]/98 backdrop-blur-xl border-t border-[#D39A4A]/25 rounded-t-[3rem] z-[110] flex flex-col transition-transform duration-300 ease-in-out shadow-[0_-20px_50px_rgba(0,0,0,0.8)] ${
            expandedCommentReel ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '70dvh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex justify-center pt-5 pb-3 cursor-pointer" onClick={() => setExpandedCommentReel(null)}>
            <div className="w-16 h-1.5 bg-white/10 rounded-full"></div>
          </div>
          
          {expandedCommentReel && (() => {
             const reel = reels.find(r => (r._id || r.id) === expandedCommentReel);
             if (!reel) return null;
             return (
                <div className="flex-1 overflow-y-auto px-6 pb-[120px]">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-[#D39A4A] mb-8 border-b border-white/5 pb-4">
                    <span>{reel.commentsCount || 0} Devotional Comments</span>
                    <span className="opacity-50">{reel.likesCount || 0} Blessings</span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 mb-8">
                    <input
                      value={commentInputs[reel._id || reel.id] || ''}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [reel._id || reel.id]: e.target.value }))}
                      placeholder="Add a spiritual reflection..."
                      className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none px-2"
                    />
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                      <p className="text-[9px] text-gray-500 italic uppercase tracking-wider">Jai Shri Krishna</p>
                      <button
                        onClick={() => handleCommentSubmit(reel)}
                        disabled={submittingCommentId === (reel._id || reel.id)}
                        className="text-[9px] px-6 py-2 rounded-xl border border-[#D39A4A]/40 bg-[#D39A4A]/10 text-[#E6C38A] font-black uppercase tracking-[0.2em] disabled:opacity-50 shadow-lg"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {(Array.isArray(reel.comments) && reel.comments.length > 0) ? reel.comments.map((comment) => (
                      <div key={comment.id || `${comment.userId || 'u'}-${comment.createdAt || comment.text}`} className="group">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-[11px] font-black text-[#E6C38A] uppercase tracking-widest">{comment.userName || 'Seeker'}</p>
                          <p className="text-[8px] text-gray-600 uppercase tracking-widest">{new Date(comment.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-serif italic">{comment.text}</p>
                        
                        <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canViewCommenterProfile(reel) && (
                            <button
                              onClick={() => setSelectedCommentProfile({ ...comment })}
                              className="text-[8px] text-[#D39A4A] font-black uppercase tracking-[0.2em]"
                            >
                              View Profile
                            </button>
                          )}
                          {(String(comment.userId) === String(user?.id || user?._id) || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteComment(reel, comment.id || comment._id)}
                              className="text-[8px] text-red-500 font-black uppercase tracking-[0.2em]"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="h-40 flex flex-col items-center justify-center opacity-30">
                        <Music className="w-10 h-10 text-gray-500 mb-4" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Silence is also prayer.</p>
                      </div>
                    )}
                  </div>
                </div>
             );
          })()}
        </div>

        {selectedCommentProfile && (
          <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center px-6">
            <div className="w-full max-w-sm rounded-[3rem] border border-[#D39A4A]/40 bg-[#081627]/95 p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <div className="w-20 h-20 bg-devotion-gold/10 rounded-full flex items-center justify-center border border-devotion-gold/30 mb-8 mx-auto">
                 <Bookmark className="w-10 h-10 text-devotion-gold" />
              </div>
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-[0.3em] text-center">Seeker Profile</h3>
              <div className="space-y-4 text-xs">
                <p className="text-gray-400 uppercase tracking-widest flex justify-between"><span>Name</span> <span className="text-white">{selectedCommentProfile.userName || 'Seeker'}</span></p>
                <p className="text-gray-400 uppercase tracking-widest flex justify-between"><span>Role</span> <span className="text-devotion-gold">{selectedCommentProfile.userRole || 'Seeker'}</span></p>
                <div className="h-px bg-white/5 my-6"></div>
                <p className="text-white text-base font-serif italic text-center leading-relaxed">"{selectedCommentProfile.text}"</p>
              </div>
              <button
                onClick={() => setSelectedCommentProfile(null)}
                className="mt-10 w-full px-6 py-4 rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
              >
                Return to Flow
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
