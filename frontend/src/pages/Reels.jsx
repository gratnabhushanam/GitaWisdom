import React, { useEffect, useCallback, useMemo } from 'react';
import { Music, PlusCircle, Bookmark, Volume2, VolumeX, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
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
    user, reels, pendingReels, loading, error, commentInputs, setCommentInputs,
    submittingCommentId, moderatingId, bgIndex, expandedCommentReel, setExpandedCommentReel,
    savedReelMap, selectedCommentProfile, setSelectedCommentProfile, activeReelId,
    soundEnabled, setSoundEnabled, likePopReelId, pausedReelId, reelsFeedRef,
    canViewCommenterProfile, handleToggleLike, handleShare, setActiveReelId, 
    setPausedReelId, handleVideoSurfaceTap, fetchReels
  } = useReels();

  // Optimized IntersectionObserver for Mobile Viewports
  useEffect(() => {
    const container = reelsFeedRef.current;
    if (!container || !reels.length) return;

    // Force first reel active if none selected
    if (!activeReelId && reels.length > 0) {
      setActiveReelId(String(reels[0]._id || reels[0].id));
    }

    const observerOptions = {
      root: null,
      threshold: 0.3, // More lenient for mobile headers/navs
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          const reel = reels[index];
          if (reel) {
            const nextActiveId = String(reel._id || reel.id);
            setActiveReelId(nextActiveId);
            setPausedReelId('');
          }
        }
      });
    }, observerOptions);

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [reels, setActiveReelId, setPausedReelId, reelsFeedRef]);

  // Smooth Scroll Management (Wheel + Keys)
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

    let wheelTimeout;
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        if (wheelTimeout) return;
        const activeIndex = reels.findIndex(r => String(r._id || r.id) === activeReelId);
        if (e.deltaY > 0) scrollToReel(activeIndex + 1);
        else scrollToReel(activeIndex - 1);
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 600);
      }
    };

    const handleKeyDown = (e) => {
      const activeIndex = reels.findIndex(r => String(r._id || r.id) === activeReelId);
      if (e.key === 'ArrowDown') { e.preventDefault(); scrollToReel(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); scrollToReel(activeIndex - 1); }
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
      <div className="flex flex-col items-center gap-6">
        <div className="w-14 h-14 border-t-4 border-[#D39A4A] rounded-full animate-spin shadow-[0_0_30px_rgba(211,154,74,0.4)]"></div>
        <p className="text-[#D39A4A] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Divine Feed</p>
      </div>
    </div>
  );

  if (error || (reels.length === 0 && !loading)) {
    return (
      <div className="h-[100dvh] w-full bg-[#050B14] flex flex-col items-center justify-center text-center px-10">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-8 animate-bounce-slow">
          <AlertCircle className="w-12 h-12 text-red-500/60" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{error || 'No Reels Found'}</h2>
        <p className="text-gray-400 text-sm mb-12 max-w-xs leading-relaxed italic opacity-80">"The divine flow may be paused. Let us attempt to reconnect your spirit."</p>
        <button 
          onClick={fetchReels} 
          className="flex items-center gap-3 px-10 py-5 rounded-3xl bg-devotion-gold text-[#050B14] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-90"
        >
          <RefreshCw className="w-4 h-4" /> RETRY SYNC
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative overflow-hidden overscroll-none touch-none">
      
      {/* Dynamic Backgrounds */}{REELS_BACKGROUND_SCENES.map((image, index) => (
        <div
          key={image}
          className={`fixed inset-0 bg-cover bg-center transition-opacity duration-1000 pointer-events-none ${index === bgIndex ? 'opacity-30' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${image}')` }}
          aria-hidden="true"
        />
      ))}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* Main Feed Container */}
      <div 
        ref={reelsFeedRef} 
        className="w-full h-full md:max-w-[420px] mx-auto relative z-10 bg-black md:border-x md:border-white/10 snap-y snap-mandatory overflow-y-scroll no-scrollbar scroll-smooth overscroll-none"
      >
        {reels.map((reel, index) => {
          const reelId = String(reel._id || reel.id);
          const isActive = reelId === activeReelId;
          const isPausedByTap = pausedReelId === reelId;
          const shouldPlay = isActive && !isPausedByTap;
          
          const activeIndex = reels.findIndex(r => String(r._id || r.id) === activeReelId);
          const distance = Math.abs(index - activeIndex);
          const isNear = distance <= 2; // Performance: only render 2 away

          return (
            <div 
              key={reelId} 
              data-index={index} 
              className="h-full min-h-[100dvh] w-full relative snap-center flex flex-col justify-end bg-black overflow-hidden"
            >
              {/* Video Surface */}
              <div className="absolute inset-0 z-0">
                {isNear ? (
                  <MediaPlayerHLS
                    url={reel.videoUrl || reel.youtubeUrl || reel.url}
                    hlsUrl={reel.hlsUrl}
                    title={reel.title}
                    className="w-full h-full object-cover"
                    autoPlay={shouldPlay}
                    shouldPlay={shouldPlay}
                    muted={!shouldPlay || !soundEnabled}
                    loop={true}
                    controls={false}
                    instagramMode={true}
                    preload={distance === 0 ? "auto" : "metadata"}
                  />
                ) : (
                  <div className="w-full h-full bg-[#050B14] flex items-center justify-center">
                     <img src={reel.thumbnail || '/krishna-line-art.svg'} className="w-full h-full object-cover opacity-20 blur-sm" alt="Preview" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
              </div>

              {/* Interaction Overlay */}
              <button
                type="button"
                onClick={() => handleVideoSurfaceTap(reel, reelId)}
                className="absolute inset-0 z-[15] cursor-pointer"
                aria-label="Toggle Playback"
              />

              {/* Floating Mute Toggle */}
              <button
                onClick={() => setSoundEnabled(p => !p)}
                className={`absolute top-24 right-6 z-[25] w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all active:scale-90 ${soundEnabled ? 'bg-[#D39A4A]/40 border-[#E6C38A]/50 text-white' : 'bg-black/50 border-white/20 text-white/60'}`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Pause State UI */}
              {isPausedByTap && isActive && (
                <div className="absolute inset-0 z-[22] flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                  <div className="w-20 h-20 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-10 h-10 text-white ml-1.5" />
                  </div>
                </div>
              )}

              {/* Like Animation */}
              {likePopReelId === reelId && (
                <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                  <img src="/ram-symbol.svg" className="w-32 h-32 object-contain animate-fade-in-up drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]" alt="Blessing" />
                </div>
              )}

              {/* Content Info */}
              <div className="relative z-20 w-full px-6 pb-28 md:pb-10 flex justify-between items-end gap-6 pointer-events-none">
                 <div className="flex-1 drop-shadow-2xl pointer-events-auto">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tighter leading-none">{reel.title}</h2>
                    <p className="text-sm font-medium text-gray-200 line-clamp-2 italic font-serif leading-relaxed opacity-90">{reel.description || 'Spiritual wisdom in motion.'}</p>
                    <div className="flex items-center gap-3 mt-5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-fit backdrop-blur-md">
                       <Music className="w-4 h-4 text-devotion-gold animate-pulse" />
                       <div className="w-32 overflow-hidden">
                          <marquee className="text-[10px] font-black text-[#E6C38A] uppercase tracking-widest">Lord Krishna Wisdom • Gita Mentor</marquee>
                       </div>
                    </div>
                 </div>

                 {/* Action Sidebar */}
                 <div className="flex flex-col gap-6 items-center pointer-events-auto">
                    <button className="flex flex-col items-center group" onClick={() => handleToggleLike(reel)}>
                       <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl transition-all group-active:scale-90 group-hover:bg-red-500/10 group-hover:border-red-500/30">
                          <img src="/ram-symbol.svg" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" alt="Like" />
                       </div>
                       <span className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">{reel.likesCount || 0}</span>
                    </button>

                    <button className="flex flex-col items-center group" onClick={() => setExpandedCommentReel(reelId)}>
                       <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl transition-all group-active:scale-90">
                          <img src="/krishna-symbol.svg" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,191,255,0.5)]" alt="Comment" />
                       </div>
                       <span className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">{reel.commentsCount || 0}</span>
                    </button>

                    <button className="flex flex-col items-center group" onClick={() => handleShare(reel)}>
                       <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl transition-all group-active:scale-90">
                          <img src="/hanuman-symbol.svg" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,165,0,0.5)]" alt="Share" />
                       </div>
                       <span className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">Share</span>
                    </button>
                 </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Floating Header */}
      <div className="fixed top-0 left-0 w-full z-[100] md:max-w-[420px] md:left-1/2 md:-translate-x-1/2">
        <div className="flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <h1 className="text-xl font-black text-white uppercase tracking-[0.4em] drop-shadow-2xl">Divine Reels</h1>
          <Link to="/upload-reel" className="w-11 h-11 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl transition-all active:scale-90">
            <PlusCircle className="w-6 h-6 text-white" />
          </Link>
        </div>
      </div>

      {/* Comment Drawer Sheet */}
      {expandedCommentReel && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={() => setExpandedCommentReel(null)} />
          <div className="fixed bottom-0 left-0 w-full md:max-w-[420px] md:left-1/2 md:-translate-x-1/2 bg-[#0A121E] rounded-t-[3rem] z-[210] flex flex-col h-[75vh] animate-in slide-in-from-bottom duration-500 shadow-[0_-30px_100px_rgba(0,0,0,1)] border-t border-white/5">
            <div className="flex justify-center pt-4 pb-2"><div className="w-12 h-1.5 bg-white/10 rounded-full" /></div>
            <div className="flex-1 overflow-y-auto px-6 pt-6">
               <h3 className="text-[11px] font-black text-devotion-gold uppercase tracking-[0.4em] mb-8 border-b border-white/5 pb-4">Spiritual Reflections</h3>
               <div className="text-center py-20 opacity-30">
                  <Music className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Join the divine conversation</p>
               </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
