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

  const fetchReels = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'x-api-key': ENV.API_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const [curatedResponse, userReelsResponse] = await Promise.all([
        axios.get(`${ENV.API_BASE_URL}/api/videos/reels`, { headers }).catch(e => e.response || e),
        axios.get(`${ENV.API_BASE_URL}/api/videos/user-reels`, { headers }).catch(e => e.response || e),
      ]);

      const isAuthError = (resp) => {
        if (!resp) return false;
        if (resp.status === 401 || resp.status === 403) return true;
        if (typeof resp.data === 'string' && resp.data.includes('<form') && resp.data.includes('SIGN IN')) return true;
        return false;
      };

      if (isAuthError(curatedResponse) || isAuthError(userReelsResponse)) {
        setError('Session expired. Please sign in again.');
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
      
      // Prevent duplicates by ID
      const uniqueReels = [];
      const seen = new Set();
      mergedReels.forEach(r => {
         const id = String(r._id || r.id);
         if (!seen.has(id)) {
            seen.add(id);
            uniqueReels.push(r);
         }
      });

      setReels(uniqueReels);
      if (uniqueReels.length > 0) {
        setActiveReelId(String(uniqueReels[0]._id || uniqueReels[0].id));
      }
    } catch (err) {
      setError('Connection issue. Please check your internet.');
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
    
    // Admin pending reels check
    if (user?.role === 'admin') {
      const token = localStorage.getItem('token');
      axios.get(`${ENV.API_BASE_URL}/api/videos/user-reels?status=pending`, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-api-key': ENV.API_KEY 
        } 
      }).then(res => setPendingReels(res.data || [])).catch(() => {});
    }
  }, [user?.role]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REELS_SOUND_PREF_KEY);
      if (raw === null) {
        const isLikelyMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setSoundEnabled(!isLikelyMobile);
      } else {
        setSoundEnabled(raw === 'true');
      }
    } catch { setSoundEnabled(false); }
  }, []);

  useEffect(() => {
    localStorage.setItem(REELS_SOUND_PREF_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const handleToggleLike = async (reel) => {
    const reelId = reel._id || reel.id;
    const normalizedId = String(reelId);
    
    // Fast UI update for curated reels (local state only)
    if (!reel.isUserReel) {
      const alreadyLiked = Boolean(likedReelMap[normalizedId]);
      setLikedReelMap(prev => ({ ...prev, [normalizedId]: !alreadyLiked }));
      setReels(prev => prev.map(r => (String(r._id || r.id) === normalizedId ? { ...r, likesCount: Math.max(0, (r.likesCount || 0) + (alreadyLiked ? -1 : 1)) } : r)));
      setLikePopReelId(normalizedId);
      setTimeout(() => setLikePopReelId(''), 700);
      return;
    }

    // Backend sync for user reels
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${ENV.API_BASE_URL}/api/videos/user-reels/${reelId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'x-api-key': ENV.API_KEY }
      });
      setReels(prev => prev.map(r => (String(r._id || r.id) === normalizedId ? res.data.reel : r)));
      setLikePopReelId(normalizedId);
      setTimeout(() => setLikePopReelId(''), 700);
    } catch (e) { console.error(e); }
  };

  const handleVideoSurfaceTap = (reel, reelId) => {
    const now = Date.now();
    const normalizedId = String(reelId);
    const isDoubleTap = lastTapRef.current.reelId === normalizedId && (now - lastTapRef.current.time) < 300;

    if (isDoubleTap) {
      clearTimeout(singleTapTimerRef.current);
      lastTapRef.current = { reelId: '', time: 0 };
      handleToggleLike(reel);
    } else {
      lastTapRef.current = { reelId: normalizedId, time: now };
      singleTapTimerRef.current = setTimeout(() => {
        setPausedReelId(prev => (prev === normalizedId ? '' : normalizedId));
        lastTapRef.current = { reelId: '', time: 0 };
      }, 300);
    }
  };

  return {
    user, reels, pendingReels, loading, error, commentInputs, setCommentInputs,
    submittingCommentId, moderatingId, bgIndex, expandedCommentReel, setExpandedCommentReel,
    savedReelMap, selectedCommentProfile, setSelectedCommentProfile, activeReelId,
    soundEnabled, setSoundEnabled, likePopReelId, pausedReelId, reelsFeedRef,
    canViewCommenterProfile, handleToggleLike, setActiveReelId, setPausedReelId,
    handleVideoSurfaceTap, fetchReels,
    handleShare: async (reel) => {
      try {
        const text = `${reel.title}\n${reel.description || ''}`;
        if (navigator.share) await navigator.share({ title: reel.title, text, url: reel.videoUrl || reel.url });
        else await navigator.clipboard.writeText(`${text}\n${reel.videoUrl || reel.url}`);
      } catch {}
    }
  };
};
