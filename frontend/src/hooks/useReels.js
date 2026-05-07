import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ENV } from '../config/env';

const SAVED_REELS_KEY = 'saved_reels_v1';
const REELS_SOUND_PREF_KEY = 'reels_sound_enabled_v1';

export const useReels = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const currentUserId = user ? String(user.id || user._id) : null;

  const isReelOwner = (reel) => {
    const ownerId = reel ? String(reel.uploadedBy || reel.userId || '') : '';
    return Boolean(ownerId && currentUserId && ownerId === currentUserId);
  };

  const canViewCommenterProfile = (reel) => Boolean(user?.role === 'admin' || isReelOwner(reel));

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const [curatedResponse, userReelsResponse] = await Promise.all([
          axios.get(`${ENV.API_BASE_URL}/api/videos/reels`, { headers: { 'x-api-key': ENV.API_KEY } }).catch((err) => err.response || err),
          axios.get(`${ENV.API_BASE_URL}/api/videos/user-reels`, { headers: { 'x-api-key': ENV.API_KEY } }).catch((err) => err.response || err),
        ]);

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
        const response = await axios.get(`${ENV.API_BASE_URL}/api/videos/user-reels?status=pending`, { headers: { 'x-api-key': ENV.API_KEY } });
        setPendingReels(response.data || []);
      } catch (err) {
        console.error('Failed to fetch pending reels:', err);
        setPendingReels([]);
      }
    };

    fetchReels();
    fetchPendingModeration();
  }, [user?.role]);

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
      setBgIndex((prev) => (prev + 1) % 3);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => () => {
    if (likePopTimerRef.current) clearTimeout(likePopTimerRef.current);
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
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

    if (likePopTimerRef.current) clearTimeout(likePopTimerRef.current);

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
      const response = await axios.post(`${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/like`, {}, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY
        },
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
        await axios.post(`${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/share`, {}, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY
          },
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
        `${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/comments`,
        { text },
        { headers: { 
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY
        } }
      );
      
      try {
        const pointsRes = await axios.post(`${ENV.API_BASE_URL}/api/auth/profile/points`, { points: 5 }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY
          }
        });
        if (pointsRes.data.user) setUser(pointsRes.data.user);
      } catch (err) {}
      
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
    if (!window.confirm('Delete your comment permanently?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/comments/${commentId}`,
        { headers: { 
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY
        } }
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
        `${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/moderate`,
        { status },
        { headers: { 
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY
        } }
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
      alert('Please login to save reels.');
      return;
    }

    const reelId = String(reel._id || reel.id);
    if (!reelId) return;

    try {
      const raw = localStorage.getItem(SAVED_REELS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      
      const isAlreadySaved = list.some(
        (item) => String(item.reelId) === reelId && String(item.savedByUserId) === currentUserId
      );

      let nextMap = { ...savedReelMap };

      if (!isAlreadySaved) {
        list.push({
          reelId: reelId,
          title: reel.title || 'Saved Reel',
          description: reel.description || '',
          likesCount: reel.likes?.length || 0,
          commentsCount: reel.comments?.length || 0,
          sharesCount: reel.shares || 0,
          savedByUserId: currentUserId,
          savedAt: new Date().toISOString()
        });
        nextMap[reelId] = true;
      } else {
        const index = list.findIndex(
          (item) => String(item.reelId) === reelId && String(item.savedByUserId) === currentUserId
        );
        if (index > -1) {
          list.splice(index, 1);
        }
        delete nextMap[reelId];
      }
      
      localStorage.setItem(SAVED_REELS_KEY, JSON.stringify(list));
      setSavedReelMap(nextMap);
      
    } catch(err) {
      console.error('Failed to save to localStorage', err);
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.post(`${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/save`, {}, {
           headers: { 
              Authorization: `Bearer ${token}`,
              'x-api-key': ENV.API_KEY
          }
        });
        
        if (response.data.savedReels && typeof setUser === 'function') {
           setUser({ ...user, savedReels: response.data.savedReels });
        }
      }
    } catch (error) {
      console.error('Failed to sync saved reel into database:', error);
    }
  };

  // Legacy handleScroll removed, now using IntersectionObserver in Reels.jsx

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

  return {
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
  };
};
