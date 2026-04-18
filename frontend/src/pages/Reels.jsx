import React, { useState, useEffect, useRef } from 'react';
// Krishna-themed SVG asset for floating animation
const FLOATING_KRISHNA = '/krishna-floating.svg';
import axios from 'axios';
import { Music, PlusCircle, Bookmark, Volume2, VolumeX, Play, Pause, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import MediaPlayerHLS from '../components/MediaPlayerHLS';
import { useAuth } from '../context/AuthContext';

const REELS_BACKGROUND_SCENES = [
  '/scene-krishna.svg',
  '/scene-ram.svg',
  '/scene-hanuman.svg',
];
const SAVED_REELS_KEY = 'saved_reels_v1';
const REELS_SOUND_PREF_KEY = 'reels_sound_enabled_v1';

export default function Reels() {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [reels, setReels] = useState([]);
  const [pendingReels, setPendingReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingCommentId, setSubmittingCommentId] = useState(null);
  const [moderatingId, setModeratingId] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [likedReelMap, setLikedReelMap] = useState({});
  const [expandedCommentReel, setExpandedCommentReel] = useState(null);
  const [savedReelMap, setSavedReelMap] = useState({});
  const [selectedCommentProfile, setSelectedCommentProfile] = useState(null);
  const [activeReelId, setActiveReelId] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [likePopReelId, setLikePopReelId] = useState('');
  const [pausedReelId, setPausedReelId] = useState('');
  const reelsFeedRef = useRef(null);
  const likePopTimerRef = useRef(null);
  const singleTapTimerRef = useRef(null);
  const lastTapRef = useRef({ reelId: '', time: 0 });

  const currentUserId = Number(user?.id || user?._id || 0);

  const isReelOwner = (reel) => {
    const ownerId = Number(reel?.uploadedBy || 0);
    return Boolean(ownerId && currentUserId && ownerId === currentUserId);
  };

  const canViewCommenterProfile = (reel) => Boolean(user?.role === 'admin' || isReelOwner(reel));

  useEffect(() => {
    // Fetch reels and pending moderation reels
    const fetchReels = async () => {
      try {
        const [curatedResponse, userReelsResponse] = await Promise.all([
          axios.get('/api/videos/reels').catch((err) => err.response || err),
          axios.get('/api/videos/user-reels').catch((err) => err.response || err),
        ]);

        // Detect if either response is a login page (HTML) or 401/403
        const isAuthError = (resp) => {
          if (!resp) return true;
          if (resp.status === 401 || resp.status === 403) return true;
          if (typeof resp.data === 'string' && resp.data.includes('<form') && resp.data.includes('SIGN IN')) return true;
          return false;
        };

        if (isAuthError(curatedResponse) || isAuthError(userReelsResponse)) {
          setError('You must be logged in to view reels. Please sign in.');
          setReels([]);
          return;
        }

        const curatedData = Array.isArray(curatedResponse.data) ? curatedResponse.data : [];
        const userReelsData = Array.isArray(userReelsResponse.data) ? userReelsResponse.data : [];

        const safeUserReels = userReelsData.filter(
          (reel) =>
            reel.isUserReel &&
            reel.moderationStatus === 'approved' &&
            String(reel.contentType || 'other') === 'spiritual'
        );

        const mergedReels = [...safeUserReels, ...curatedData];
        setReels(mergedReels);
      } catch (err) {
        setError('Failed to load reels. Please try again later.');
        console.error('Error fetching reels:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingModeration = async () => {
      if (user?.role !== 'admin') {
        setPendingReels([]);
        return;
      }
      try {
        const response = await axios.get('/api/videos/user-reels?status=pending');
        setPendingReels(response.data || []);
      } catch (err) {
        console.error('Failed to fetch pending reels:', err);
        setPendingReels([]);
      }
    };

    fetchReels();
    fetchPendingModeration();
  }, [user?.role]);

  // Sound preference effect
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REELS_SOUND_PREF_KEY);
      if (raw === null) {
        const isLikelyMobile = (() => {
          if (typeof window === 'undefined') return false;
          const touchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
          const narrowViewport = window.innerWidth <= 768;
          return touchDevice || narrowViewport;
        })();
        setSoundEnabled(!isLikelyMobile);
        return;
      }
      setSoundEnabled(raw === 'true');
    } catch (error) {
      console.error('Failed to load reel sound preference:', error);
      setSoundEnabled(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REELS_SOUND_PREF_KEY, String(soundEnabled));
    } catch (error) {
      console.error('Failed to save reel sound preference:', error);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      const dbSaved = Array.isArray(user?.savedReels) ? user.savedReels : [];
      const nextMap = {};
      dbSaved.forEach(id => {
         nextMap[String(id)] = true;
      });
      setSavedReelMap(nextMap);
    } catch (error) {
      console.error('Failed to load saved reels natively:', error);
      setSavedReelMap({});
    }
  }, [user]);

  useEffect(() => {
    if (!reels.length) {
      setActiveReelId('');
      return;
    }

    const firstId = String(reels[0]._id || reels[0].id || '');
    setActiveReelId(firstId);
    setPausedReelId('');
  }, [reels]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % REELS_BACKGROUND_SCENES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => () => {
    if (likePopTimerRef.current) {
      clearTimeout(likePopTimerRef.current);
    }
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const focusReelId = location?.state?.focusReelId;
    if (!focusReelId || !reels.length) return;

    const targetIndex = reels.findIndex((item) => String(item._id || item.id) === String(focusReelId));
    if (targetIndex === -1) return;

    const container = reelsFeedRef.current;
    if (!container) return;

    const target = container.children[targetIndex];
    if (!target || typeof target.scrollIntoView !== 'function') return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location?.state?.focusReelId, reels]);

  const updateReelInState = (updatedReel) => {
    setReels((prev) => prev.map((reel) => ((reel._id || reel.id) === (updatedReel._id || updatedReel.id) ? updatedReel : reel)));
  };

  const triggerLikePop = (reelId) => {
    const normalizedId = String(reelId || '');
    if (!normalizedId) return;

    if (likePopTimerRef.current) {
      clearTimeout(likePopTimerRef.current);
    }

    setLikePopReelId(normalizedId);
    likePopTimerRef.current = setTimeout(() => {
      setLikePopReelId('');
      likePopTimerRef.current = null;
    }, 700);
  };

  const handleToggleLike = async (reel) => {
    const reelId = reel._id || reel.id;
    triggerLikePop(reelId);

    if (!reel.isUserReel) {
      const alreadyLiked = Boolean(likedReelMap[reelId]);
      setLikedReelMap((prev) => ({ ...prev, [reelId]: !alreadyLiked }));
      setReels((prev) =>
        prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId !== reelId) return item;
          const nextLikes = Math.max(0, Number(item.likesCount || 0) + (alreadyLiked ? -1 : 1));
          return { ...item, likesCount: nextLikes };
        })
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/videos/user-reels/${reelId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateReelInState(response.data.reel);
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleShare = async (reel) => {
    const reelId = reel._id || reel.id;
    try {
      if (reel.isUserReel) {
        const token = localStorage.getItem('token');
        await axios.post(`/api/videos/user-reels/${reelId}/share`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const shareText = `${reel.title}\n\n${reel.description || 'Gita wisdom reel'}`;
      if (navigator.share) {
        await navigator.share({ title: reel.title, text: shareText, url: reel.videoUrl || reel.url });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${reel.videoUrl || reel.url || ''}`);
      }

      setReels((prev) =>
        prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId !== reelId) return item;
          return { ...item, sharesCount: Number(item.sharesCount || 0) + 1 };
        })
      );
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Error sharing reel:', error);
      }
    }
  };
  const handleCommentSubmit = async (reel) => {
    const reelId = reel._id || reel.id;
    const text = String(commentInputs[reelId] || '').trim();
    if (!text) return;

    if (!reel.isUserReel) {
      setReels((prev) =>
        prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId !== reelId) return item;
          const nextComments = [
            {
              id: Date.now(),
              userName: user?.name || 'Devotee',
              userEmail: user?.email || null,
              userProfilePicture: user?.profilePicture || null,
              text,
              createdAt: new Date().toISOString(),
            },
            ...(Array.isArray(item.comments) ? item.comments : []),
          ];
          return {
            ...item,
            comments: nextComments,
            commentsCount: Number(item.commentsCount || 0) + 1,
          };
        })
      );
      setCommentInputs((prev) => ({ ...prev, [reelId]: '' }));
      return;
    }

    try {
      setSubmittingCommentId(reelId);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/videos/user-reels/${reelId}/comments`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Award points for interacting
      try {
        const pointsRes = await axios.post('/api/auth/profile/points', { points: 5 }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pointsRes.data.user) {
          setUser(pointsRes.data.user);
        }
      } catch (err) {
        console.error('Points increment failed silently', err);
      }
      
      updateReelInState(response.data);
      setCommentInputs((prev) => ({ ...prev, [reelId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleDeleteComment = async (reel, commentId) => {
    const reelId = reel._id || reel.id;
    const confirmed = window.confirm('Delete your comment permanently?');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `/api/videos/user-reels/${reelId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateReelInState(response.data.reel);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment.');
    }
  };

  const handleModeration = async (reelId, status) => {
    try {
      setModeratingId(reelId);
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/videos/user-reels/${reelId}/moderate`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingReels((prev) => prev.filter((item) => (item._id || item.id) !== reelId));
    } catch (error) {
      console.error('Error moderating reel:', error);
    } finally {
      setModeratingId(null);
    }
  };

  const handleSaveReel = async (reel) => {
    if (!currentUserId) {
      alert('Please login to save & download reels.');
      return;
    }

    const reelId = String(reel._id || reel.id);
    if (!reelId) return;

    // Phase 1: Native Physical Download Override
    try {
        let downloadUrl = reel.videoUrl || reel.youtubeUrl || reel.url;
        if (downloadUrl && downloadUrl.includes('/uploads/')) {
           const downloadUrlObj = new URL(downloadUrl, window.location.origin);
           const token = localStorage.getItem('token');
           if (token) downloadUrlObj.searchParams.set('token', token);
           downloadUrlObj.searchParams.set('download', 'true');
           
           const a = document.createElement('a');
           a.style.display = 'none';
           a.href = downloadUrlObj.toString();
           a.download = `GitaWisdom_Reel_${reel.title || reelId}.mp4`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
        } else if (downloadUrl) {
           // Direct External URL Download Trigger
           window.open(downloadUrl, '_blank');
        }
    } catch(err) { console.error('Failed to trigger native download action', err); }

    // Phase 2: Secure Database Backend Tracking Over JWT
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/videos/user-reels/${reelId}/save`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      const nextMap = { ...savedReelMap };
      if (response.data.isSaved) {
         nextMap[reelId] = true;
      } else {
         delete nextMap[reelId];
      }
      setSavedReelMap(nextMap);
      
      // Optionally refresh global user context securely if desired
      if (response.data.savedReels && typeof setUser === 'function') {
         setUser({ ...user, savedReels: response.data.savedReels });
      }

    } catch (error) {
      console.error('Failed to sync saved reel into database:', error);
      alert('Network Error tracking this save sequence in user history.');
    }
  };

  const handleScroll = (e) => {
    const container = e.currentTarget;
    if (!container || !reels.length) return;

    const reelHeight = container.clientHeight || 1;
    const index = Math.max(0, Math.min(reels.length - 1, Math.round(container.scrollTop / reelHeight)));
    const current = reels[index];
    const nextActiveId = String(current?._id || current?.id || '');
    if (nextActiveId && nextActiveId !== activeReelId) {
      setActiveReelId(nextActiveId);
      setPausedReelId('');
    }
  };

  const handleVideoTap = (reelId) => {
    const normalizedId = String(reelId || '');
    if (!normalizedId) return;
    if (normalizedId !== activeReelId) return;

    setPausedReelId((prev) => (prev === normalizedId ? '' : normalizedId));
  };

  const handleVideoSurfaceTap = (reel, reelId) => {
    const normalizedId = String(reelId || '');
    if (!normalizedId) return;

    const now = Date.now();
    const lastTap = lastTapRef.current;
    const isDoubleTap = lastTap.reelId === normalizedId && (now - Number(lastTap.time || 0)) <= 280;

    if (isDoubleTap) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = { reelId: '', time: 0 };
      handleToggleLike(reel);
      return;
    }

    lastTapRef.current = { reelId: normalizedId, time: now };
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
    }
    singleTapTimerRef.current = setTimeout(() => {
      handleVideoTap(normalizedId);
      singleTapTimerRef.current = null;
      lastTapRef.current = { reelId: '', time: 0 };
    }, 280);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#D39A4A]"></div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <div className="text-2xl font-bold text-yellow-400 mb-4">{error}</div>
        {error.includes('login') || error.includes('sign in') ? (
          <Link to="/login" className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform">Go to Login</Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative overflow-hidden">
      
      {/* Background Decor */}{REELS_BACKGROUND_SCENES.map((image, index) => (
        <div
          key={image}
          className={`fixed inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${image}')` }}
          aria-hidden="true"
        />
      ))}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(211,154,74,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(69,129,163,0.25),transparent_36%),linear-gradient(to_bottom,rgba(4,16,33,0.78),rgba(7,12,24,0.85))] backdrop-blur-[1px]" />

      {user?.role === 'admin' && pendingReels.length > 0 && (
        <div className="fixed top-24 left-4 right-4 md:left-auto md:right-10 md:w-[420px] z-50 bg-[#0B1F3A]/95 border border-[#D39A4A]/40 rounded-3xl p-5 backdrop-blur-xl shadow-2xl max-h-[55vh] overflow-y-auto">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#E6C38A] mb-4">Pending User Reels</h2>
          <div className="space-y-3">
            {pendingReels.map((item) => {
              const pendingId = item._id || item.id;
              return (
                <div key={pendingId} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                  <p className="text-[11px] text-gray-400 mb-3 line-clamp-2">{item.description || 'No description'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeration(pendingId, 'approved')}
                      disabled={moderatingId === pendingId}
                      className="flex-1 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModeration(pendingId, 'rejected')}
                      disabled={moderatingId === pendingId}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="w-full h-full relative z-10">
        
        {/* Fixed Top Header - Always visible */}
        <div className="fixed top-0 left-0 w-full z-[120] md:max-w-[420px] md:left-1/2 md:-translate-x-1/2">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <h1 className="text-lg font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">Reels</h1>
            <Link to="/upload-reel" className="flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full p-2.5 border border-white/20 hover:bg-white/10 transition-colors shadow-lg">
               <PlusCircle className="w-6 h-6 text-white" />
            </Link>
          </div>
        </div>

      <div ref={reelsFeedRef} data-reels-feed="true" className="w-full md:max-w-[420px] mx-auto h-[100dvh] relative z-10 bg-black md:border-x md:border-white/10 snap-y snap-mandatory overflow-y-scroll no-scrollbar scroll-smooth pb-16 md:pb-0" onScroll={handleScroll}>
        
        {reels.length > 0 ? reels.map((reel) => {
          const reelId = String(reel._id || reel.id || '');
          const isActive = reelId === activeReelId;
          const isPausedByTap = pausedReelId === reelId;
          const shouldPlay = isActive && !isPausedByTap;


          // Handler for auto-play next reel or launch quiz
          const handleVideoEnd = () => {
            const currentVideoId = String(reel._id || reel.id);
            // Navigate to quiz instead of auto-scrolling
            window.location.href = `/quiz?videoId=${currentVideoId}`;
          };

          return (
          <div key={reel._id || reel.id} className="h-[100dvh] w-full relative snap-center flex flex-col justify-end bg-black">

            {/* Background Video (single active playback only) */}
            <div className="absolute inset-0 z-0">
               <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-black/20 absolute z-10 pointer-events-none"></div>
               <MediaPlayerHLS
                 key={`${reelId}-${isActive ? 'active' : 'inactive'}-${shouldPlay ? 'play' : 'pause'}-${soundEnabled ? 'sound' : 'mute'}`}
                 url={reel.videoUrl || reel.youtubeUrl || reel.url}
                 hlsUrl={reel.hlsUrl}
                 title={reel.title}
                 className="w-full h-full object-cover"
                 youtubeParams={`autoplay=${shouldPlay ? 1 : 0}&mute=${shouldPlay && soundEnabled ? 0 : 1}&controls=1&loop=1&playsinline=1`}
                 autoPlay={shouldPlay}
                 shouldPlay={shouldPlay}
                 muted={!shouldPlay || !soundEnabled}
                 loop={false}
                 controls={false}
                 instagramMode={isActive}
                 onEnded={handleVideoEnd}
               />
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
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSoundEnabled((prev) => !prev); }}
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
            <div className="relative z-20 px-4 flex justify-between items-end pb-[88px] md:pb-8 w-full pointer-events-none">
               
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

               <div className="flex flex-col gap-6 items-center shrink-0 w-12 pointer-events-auto">
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
                     const reelId = reel._id || reel.id;
                     setExpandedCommentReel((prev) => (prev === reelId ? null : reelId));
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

            {/* (Comment section extracted to global Bottom Sheet Drawer) */}

          </div>
        );}) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No reels found. Check back later.</p>
          </div>
        )}
        </div>

        {/* Click-to-Dismiss Backdrop Overlay with Blur */}
        {expandedCommentReel && (
          <div 
            className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-sm animate-fade-in" 
            onClick={() => setExpandedCommentReel(null)}
            onTouchEnd={(e) => { e.preventDefault(); setExpandedCommentReel(null); }}
          />
        )}

        {/* Global Bottom Sheet Drawer for Comments */}
        <div 
          className={`fixed bottom-0 left-0 w-full md:max-w-[420px] md:left-1/2 md:-translate-x-1/2 bg-[#0b1220]/98 backdrop-blur-xl border-t border-[#D39A4A]/25 rounded-t-3xl z-[110] flex flex-col transition-transform duration-300 ease-in-out shadow-[0_-20px_50px_rgba(0,0,0,0.8)] ${
            expandedCommentReel ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: '65dvh', touchAction: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setExpandedCommentReel(null)}>
            <div className="w-12 h-1.5 bg-gray-500/50 rounded-full"></div>
          </div>
          
          {expandedCommentReel && (() => {
             const reel = reels.find(r => (r._id || r.id) === expandedCommentReel);
             if (!reel) return null;
             return (
                <div className="flex-1 overflow-y-auto px-5 pb-[100px]">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#D6D6D6] mb-4">
                    <span>{reel.commentsCount || 0} Comments</span>
                    <span className="text-gray-500">{reel.likesCount || 0} Likes</span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                    <input
                      value={commentInputs[reel._id || reel.id] || ''}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [reel._id || reel.id]: e.target.value }))}
                      placeholder="Add a spiritual comment..."
                      className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                    />
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                      <p className="text-[10px] text-gray-500 italic">Be respectful and divine.</p>
                      <button
                        onClick={() => handleCommentSubmit(reel)}
                        disabled={submittingCommentId === (reel._id || reel.id)}
                        className="text-[10px] px-4 py-1.5 rounded-lg border border-[#D39A4A]/40 bg-[#D39A4A]/10 text-[#E6C38A] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {(Array.isArray(reel.comments) && reel.comments.length > 0) ? reel.comments.map((comment) => (
                      <div key={comment.id || `${comment.userId || 'u'}-${comment.createdAt || comment.text}`} className="rounded-xl border border-white/5 bg-transparent p-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[11px] font-bold text-[#E6C38A] truncate">{comment.userName || 'Seeker'}</p>
                          <p className="text-[8px] text-gray-500 uppercase tracking-wider">{new Date(comment.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-gray-200 mt-1 leading-snug">{comment.text}</p>
                        
                        <div className="flex gap-2 mt-2">
                          {canViewCommenterProfile(reel) && (
                            <button
                              onClick={() => setSelectedCommentProfile({ ...comment })}
                              className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-white transition-colors"
                            >
                              Profile
                            </button>
                          )}
                          {(String(comment.userId) === String(user?.id || user?._id) || user?.role === 'admin') && reel.isUserReel && (
                            <button
                              onClick={() => handleDeleteComment(reel, comment.id || comment._id)}
                              className="text-[9px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="h-24 flex items-center justify-center">
                        <p className="text-xs text-gray-500">Be the first to share your devotion.</p>
                      </div>
                    )}
                  </div>
                </div>
             );
          })()}
        </div>

      </div>

      {selectedCommentProfile && (
        <div className="fixed inset-0 z-[80] bg-black/65 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#D39A4A]/40 bg-[#081627]/95 p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4 uppercase tracking-widest">Commenter Profile</h3>
            <div className="space-y-2 text-sm">
              <p className="text-white"><span className="text-[#E6C38A]">Name:</span> {selectedCommentProfile.userName || 'Seeker'}</p>
              {selectedCommentProfile.userEmail && (
                <p className="text-white"><span className="text-[#E6C38A]">Email:</span> {selectedCommentProfile.userEmail}</p>
              )}
              <p className="text-white"><span className="text-[#E6C38A]">Role:</span> {selectedCommentProfile.userRole || 'user'}</p>
              <p className="text-gray-300 mt-3">{selectedCommentProfile.text}</p>
            </div>
            <button
              onClick={() => setSelectedCommentProfile(null)}
              className="mt-5 w-full px-4 py-2 rounded-xl border border-white/20 text-white text-xs font-black uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      )}

      </div>
  );
}
