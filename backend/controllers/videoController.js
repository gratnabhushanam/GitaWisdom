const { Video, User } = require('../models');
const mongoose = require('mongoose');
const VideoMongo = require('../models/mongo/VideoMongo');
const QuizMongo = require('../models/mongo/QuizMongo');
const { mapVideo } = require('../utils/responseMappers');

const { isMongoEnabled, isMongoConnected, useMongoStore } = require('../utils/mongoStore');

const fs = require('fs');
const { getVideoDurationSeconds } = require('../utils/videoMetadata');
const { transcodeToHLS } = require('../utils/hlsTranscoder');
const path = require('path');
const jwt = require('jsonwebtoken');

exports.grantStreamingToken = async (req, res) => {
  try {
    const videoId = req.query.videoId || 'anonymous_stream';
    
    // Generate a temporary JWT license token valid for 6 hours
    const token = jwt.sign(
      { license: 'streaming_license', videoId },
      process.env.JWT_SECRET || 'dev_secret_fallback',
      { expiresIn: '6h' }
    );

    return res.status(200).json({ token, message: 'DRM License Granted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating media license' });
  }
};

// Placeholder: Add Video (admin only)
exports.addVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, hlsUrl, category, collectionTitle, isKids, tags, videoQuizDraft } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ message: 'Title and videoUrl are required' });
    }

    const newVideo = await VideoMongo.create({
      title,
      description: description || '',
      videoUrl,
      hlsUrl: hlsUrl || null,
      category: category || 'reels',
      collectionTitle: collectionTitle || 'Bhagavad Gita',
      isKids: isKids || false,
      tags: Array.isArray(tags) ? tags : [],
      isUserReel: false,
      moderationStatus: 'approved',
      contentType: 'spiritual',
      uploadedBy: req.user.id,
    });

    // Check if an embedded quiz draft was attached to this video publish
    if (videoQuizDraft && videoQuizDraft.questionText) {
      const optionMap = { A: videoQuizDraft.optionA, B: videoQuizDraft.optionB, C: videoQuizDraft.optionC, D: videoQuizDraft.optionD };
      const optionsArray = ['A', 'B', 'C', 'D'].map(k => optionMap[k]).filter(Boolean);
      const correctAnswer = optionMap[videoQuizDraft.correctOption];
      
      if (optionsArray.length >= 2 && correctAnswer) {
        await QuizMongo.create({
          videoId: newVideo._id,
          question: videoQuizDraft.questionText,
          options: optionsArray,
          correct_answer: correctAnswer,
          difficulty: 'medium'
        });
      }
    }

    return res.status(201).json(mapVideo(newVideo));
  } catch (error) {
    console.error('Error adding video:', error);
    return res.status(500).json({ message: 'Internal server error while adding video' });
  }
};

// Get curated (admin-uploaded) reels (not user reels)
exports.getReels = async (req, res) => {
  try {
    // Only fetch reels uploaded by admin (not user reels)
    const reels = await VideoMongo.find({
      isUserReel: { $ne: true },
      category: 'reels',
      moderationStatus: 'approved',
      contentType: 'spiritual',
    }).sort({ createdAt: -1 }).lean();
    res.json(reels.map(mapVideo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Placeholder: Get Kids Videos (public)

exports.getKidsVideos = async (req, res) => {
  try {
    const kidsVideos = await VideoMongo.find({
      isKids: true,
      moderationStatus: 'approved',
      contentType: 'spiritual',
    }).sort({ createdAt: -1 }).lean();
    res.json(kidsVideos.map(mapVideo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Placeholder: Get Videos (public)

// Get all Videos (public)
exports.getVideos = async (req, res) => {
  try {
    const videos = await VideoMongo.find({
      isUserReel: { $ne: true },
      moderationStatus: 'approved',
      contentType: 'spiritual',
    }).sort({ createdAt: -1 }).lean();
    res.json(videos.map(mapVideo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReels = async (req, res) => {
  try {


    if (useMongoStore()) {
      const reels = await VideoMongo.find({ 
        isUserReel: true, 
        uploadedBy: String(req.user._id || req.user.id) 
      }).sort({ createdAt: -1 });
      return res.json(reels.map(mapVideo));
    }

    const reels = await Video.findAll({
      where: { isUserReel: true, uploadedBy: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return res.json(reels.map(mapVideo));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserReelModerationQueue = async (req, res) => {
  try {
    const status = String(req.query.status || 'pending');
    const allowed = ['pending', 'approved', 'rejected'];
    const normalizedStatus = allowed.includes(status) ? status : 'pending';
    const contentType = String(req.query.contentType || 'all').toLowerCase();
    const allowedTypes = ['spiritual', 'other'];
    const normalizedContentType = allowedTypes.includes(contentType) ? contentType : 'all';



    const where = { isUserReel: true, moderationStatus: normalizedStatus };
    if (normalizedContentType !== 'all') {
      where.contentType = normalizedContentType;
    }

    if (useMongoStore()) {
      const reels = await VideoMongo.find(where).sort({ createdAt: -1 });
      if (!reels) {
        return res.json([]);
      }
      return res.json(reels.map(mapVideo));
    }

    const reels = await Video.findAll({
      where,
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(reels.map(mapVideo));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.moderateUserReel = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const allowed = ['approved', 'rejected', 'pending'];

    console.log(`[MODERATE_REEL] Incoming request: id=${id}, status=${status}, note=${note}, req.user=${req.user?.id}`);

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid moderation status' });
    }

    if (status === 'rejected' && !String(note || '').trim()) {
      return res.status(400).json({ message: 'Rejection note is required' });
    }

    const isMongo = useMongoStore();
    console.log(`[MODERATE_REEL] Using Mongo: ${isMongo}`);

    const reel = isMongo
      ? await VideoMongo.findOne({ _id: String(id), isUserReel: true })
      : await Video.findOne({ where: { id, isUserReel: true } });

    console.log(`[MODERATE_REEL] Reel found:`, reel ? true : false);

    if (!reel) {
      return res.status(404).json({ message: 'User reel not found' });
    }

    reel.moderationStatus = status;
    reel.moderationNote = note || '';
    reel.reviewedBy = req.user.id;
    await reel.save();

    console.log(`[MODERATE_REEL] Save successful! new status:`, reel.moderationStatus);
    
    return res.json(mapVideo(reel));
  } catch (error) {
    console.error(`[MODERATE_REEL] CRITICAL ERROR:`, error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMyReel = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = useMongoStore()
      ? await VideoMongo.findOne({ _id: String(id), isUserReel: true })
      : await Video.findOne({ where: { id, isUserReel: true } });

    if (!existing) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const isOwner = sameUserId(existing.uploadedBy, req.user.id) || toIntId(existing.uploadedBy) === toIntId(req.user.id);
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to edit this reel' });
    }

    if (req.body.videoUrl || req.body.youtubeUrl) {
      return res.status(400).json({ message: 'Video link updates are not allowed. Upload a video file instead.' });
    }

    const title = req.body.title ?? existing.title;
    const description = req.body.description ?? existing.description;
    const uploadedFile = req.file;
    const videoUrl = uploadedFile?.filename ? buildUploadedVideoUrl(req, uploadedFile.filename) : existing.videoUrl;
    const tags = normalizeTags(req.body.tags ?? existing.tags);

    if (!title || !videoUrl) {
      return res.status(400).json({ message: 'Title and video URL are required' });
    }

    if (uploadedFile?.path) {
      const duration = await getVideoDurationSeconds(uploadedFile.path);
      if (duration > MAX_REEL_DURATION_SECONDS) {
        fs.unlink(uploadedFile.path, () => {});
        return res.status(400).json({ message: `Reel must be ${MAX_REEL_DURATION_SECONDS} seconds or less` });
      }
    }

    const detectedSpiritual = isSpiritualContent({ title, description, tags });

    if (!detectedSpiritual && !isAdmin) {
      if (uploadedFile?.path) {
        fs.unlink(uploadedFile.path, () => {});
      }
      return res.status(400).json({
        message: 'Only spiritual content reels are allowed for user uploads.',
      });
    }

    const nextModerationStatus = isAdmin ? 'approved' : 'pending';

    existing.title = title;
    existing.description = description;
    existing.videoUrl = videoUrl;
    existing.tags = tags;
    existing.contentType = 'spiritual';
    existing.moderationStatus = nextModerationStatus;
    existing.moderationNote = '';

    await existing.save();
    return res.json({
      ...mapVideo(existing),
      message: nextModerationStatus === 'pending'
        ? 'Reel updated and resubmitted for admin review'
        : 'Reel updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteMyReel = async (req, res) => {
  try {
    const { id } = req.params;
    const reel = useMongoStore()
      ? await VideoMongo.findOne({ _id: String(id), isUserReel: true })
      : await Video.findOne({ where: { id, isUserReel: true } });
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    const isOwner = sameUserId(reel.uploadedBy, req.user.id) || toIntId(reel.uploadedBy) === toIntId(req.user.id);
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to delete this reel' });
    }
    if (useMongoStore()) {
      await reel.deleteOne();
      return res.json({ message: 'Reel deleted successfully', id: String(id) });
    }
    await reel.destroy();
    return res.json({ message: 'Reel deleted successfully', id: Number(id) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.toggleUserReelLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = toIntId(req.user.id);
    const reel = useMongoStore()
      ? await VideoMongo.findOne({ _id: String(id), isUserReel: true })
      : await Video.findOne({ where: { id, isUserReel: true } });
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    const likedBy = Array.isArray(reel.likedBy) ? reel.likedBy.map(toIntId) : [];
    const hasLiked = likedBy.includes(userId);
    reel.likedBy = hasLiked ? likedBy.filter((uid) => uid !== userId) : [...likedBy, userId];
    reel.likesCount = reel.likedBy.length;
    await reel.save();
    return res.json({ liked: !hasLiked, reel: mapVideo(reel) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.shareUserReel = async (req, res) => {
  try {
    const { id } = req.params;
    const reel = useMongoStore()
      ? await VideoMongo.findOne({ _id: String(id), isUserReel: true })
      : await Video.findOne({ where: { id, isUserReel: true } });
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    reel.sharesCount = Number(reel.sharesCount || 0) + 1;
    await reel.save();
    return res.json(mapVideo(reel));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addUserReelComment = async (req, res) => {
  try {
    const { id } = req.params;
    const text = String(req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const comment = {
      id: Date.now(),
      userId: req.user.id,
      userName: req.user.name || 'Seeker',
      userEmail: req.user.email || null,
      userProfilePicture: req.user.profilePicture || null,
      userRole: req.user.role || 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    const reel = useMongoStore()
      ? await VideoMongo.findOne({ _id: String(id), isUserReel: true })
      : await Video.findOne({ where: { id, isUserReel: true } });
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    const comments = Array.isArray(reel.comments) ? reel.comments : [];
    reel.comments = [comment, ...comments].slice(0, 200);
    reel.commentsCount = reel.comments.length;
    await reel.save();
    return res.status(201).json(mapVideo(reel));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = useMongoStore()
      ? await VideoMongo.findById(String(id))
      : await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    if (useMongoStore()) {
      await video.deleteOne();
      return res.json({ message: 'Video deleted successfully', id: String(id) });
    }
    await video.destroy();
    return res.json({ message: 'Video deleted successfully', id: Number(id) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Placeholder: Upload User Reel
exports.uploadUserReel = async (req, res) => {
  return res.status(501).json({ message: 'uploadUserReel not implemented yet' });
};

// Get all approved user reels (for feed)
exports.getUserReels = async (req, res) => {
  try {
    const status = req.query.status || 'approved';
    const filter = {
      isUserReel: true,
      moderationStatus: status,
      contentType: 'spiritual',
    };
    const reels = await VideoMongo.find(filter).sort({ createdAt: -1 }).lean();
    res.json(reels.map(mapVideo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
