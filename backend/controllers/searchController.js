const { Sloka, Story, Video, Movie } = require('../models');
const mongoose = require('mongoose');
const { isMongoEnabled, isMongoConnected, useMongoStore } = require('../utils/mongoStore');
const SlokaMongo = require('../models/mongo/SlokaMongo');
const StoryMongo = require('../models/mongo/StoryMongo');
const VideoMongo = require('../models/mongo/VideoMongo');
const MovieMongo = require('../models/mongo/MovieMongo');
const { Op } = require('sequelize');
const { mapSloka, mapStory, mapVideo, mapMovie } = require('../utils/responseMappers');


const mongoRegex = (value) => new RegExp(String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const containsQuery = (value, query) => String(value || '').toLowerCase().includes(String(query || '').toLowerCase());

const storyMatches = (story, query) => (
  containsQuery(story.title, query)
  || containsQuery(story.titleTelugu, query)
  || containsQuery(story.titleHindi, query)
  || containsQuery(story.titleEnglish, query)
  || containsQuery(story.summary, query)
  || containsQuery(story.summaryTelugu, query)
  || containsQuery(story.summaryHindi, query)
  || containsQuery(story.summaryEnglish, query)
  || containsQuery(story.content, query)
  || containsQuery(story.contentTelugu, query)
  || containsQuery(story.contentHindi, query)
  || containsQuery(story.contentEnglish, query)
  || containsQuery(story.seriesTitle, query)
);

const videoMatches = (video, query) => (
  containsQuery(video.title, query)
  || containsQuery(video.description, query)
  || containsQuery(video.category, query)
  || containsQuery(video.language, query)
  || containsQuery(video.moral, query)
);

const movieMatches = (movie, query) => (
  containsQuery(movie.title, query)
  || containsQuery(movie.description, query)
  || containsQuery(movie.ownerHistory, query)
  || containsQuery(movie.releaseYear, query)
  || (Array.isArray(movie.tags) && movie.tags.some((tag) => containsQuery(tag, query)))
);

const separateVideos = (allVideos) => {
  const normalVideos = [];
  const reels = [];
  for (const v of allVideos) {
    if (v.isUserReel && v.moderationStatus && v.moderationStatus !== 'approved') continue;
    
    const isUserReel = Boolean(v?.isUserReel);
    const category = String(v?.category || '').trim().toLowerCase();
    
    if (isUserReel || category === 'reels') {
      reels.push(mapVideo(v));
    } else {
      normalVideos.push(mapVideo(v));
    }
  }
  return { videos: normalVideos, reels };
};



exports.searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    const normalizedQuery = String(q || '').trim();

    if (!normalizedQuery) {


      if (useMongoStore()) {
        const [slokas, stories, videos, movies] = await Promise.all([
          SlokaMongo.find({}),
          StoryMongo.find({}),
          VideoMongo.find({ isUserReel: { $ne: true } }),
          MovieMongo.find({}),
        ]);

        const separated = separateVideos(videos);

        return res.json({
          slokas: slokas.map(mapSloka),
          stories: stories.map(mapStory),
          videos: separated.videos,
          reels: separated.reels,
          movies: movies.map((movie) => mapMovie(movie)),
        });
      }

      const [slokas, stories, videos, movies] = await Promise.all([
        Sloka.findAll(),
        Story.findAll({
          attributes: ['id', 'title', 'summary', 'content', 'chapter', 'language', 'thumbnail', 'tags', 'createdBy', 'createdAt', 'updatedAt'],
        }),
        Video.findAll({
          attributes: ['id', 'title', 'description', 'videoUrl', 'youtubeUrl', 'thumbnail', 'category', 'language', 'duration', 'tags', 'views', 'isKids', 'isUserReel', 'uploadedBy', 'uploadSource', 'contentType', 'moderationStatus', 'moderationNote', 'reviewedBy', 'likesCount', 'sharesCount', 'commentsCount', 'likedBy', 'comments', 'chapter', 'moral', 'script', 'createdAt', 'updatedAt'],
          where: {
            isUserReel: { [Op.not]: true },
          },
        }),
        Movie.findAll({
          attributes: ['id', 'title', 'description', 'videoUrl', 'youtubeUrl', 'thumbnail', 'releaseYear', 'ownerHistory', 'tags', 'createdAt', 'updatedAt'],
        }),
      ]);

      const separatedEmpty = separateVideos(videos);

      return res.json({
        slokas: slokas.map(mapSloka),
        stories: stories.map(mapStory),
        videos: separatedEmpty.videos,
        reels: separatedEmpty.reels,
        movies: movies.map((movie) => mapMovie(movie)),
      });
    }



    if (useMongoStore()) {
      const qRegex = mongoRegex(normalizedQuery);
      const [slokas, stories, videos, movies] = await Promise.all([
        SlokaMongo.find({
          $or: [
            { sanskrit: qRegex },
            { englishMeaning: qRegex },
            { teluguMeaning: qRegex },
            { hindiMeaning: qRegex },
          ],
        }),
        StoryMongo.find({
          $or: [
            { title: qRegex },
            { summary: qRegex },
            { content: qRegex },
            { titleEnglish: qRegex },
            { titleHindi: qRegex },
            { titleTelugu: qRegex },
            { summaryEnglish: qRegex },
            { summaryHindi: qRegex },
            { summaryTelugu: qRegex },
          ],
        }),
        VideoMongo.find({
          $or: [
            { title: qRegex },
            { description: qRegex },
            { category: qRegex },
            { language: qRegex },
          ],
        }),
        MovieMongo.find({
          $or: [
            { title: qRegex },
            { description: qRegex },
            { ownerHistory: qRegex },
          ],
        }),
      ]);

      const separatedMongo = separateVideos(videos);

      return res.json({
        slokas: slokas.map(mapSloka),
        stories: stories.map(mapStory),
        videos: separatedMongo.videos,
        reels: separatedMongo.reels,
        movies: movies.map(mapMovie),
      });
    }

    const [slokas, stories, videos, movies] = await Promise.all([
      Sloka.findAll({
        where: {
          [Op.or]: [
            { sanskrit: { [Op.like]: `%${q}%` } },
            { englishMeaning: { [Op.like]: `%${q}%` } },
            { teluguMeaning: { [Op.like]: `%${q}%` } }
          ]
        }
      }),
      Story.findAll({
        attributes: ['id', 'title', 'summary', 'content', 'chapter', 'language', 'thumbnail', 'tags', 'createdBy', 'createdAt', 'updatedAt'],
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { summary: { [Op.like]: `%${q}%` } },
            { content: { [Op.like]: `%${q}%` } }
          ]
        }
      }),
      Video.findAll({
        attributes: ['id', 'title', 'description', 'videoUrl', 'youtubeUrl', 'thumbnail', 'category', 'language', 'duration', 'tags', 'views', 'isKids', 'isUserReel', 'uploadedBy', 'uploadSource', 'contentType', 'moderationStatus', 'moderationNote', 'reviewedBy', 'likesCount', 'sharesCount', 'commentsCount', 'likedBy', 'comments', 'chapter', 'moral', 'script', 'createdAt', 'updatedAt'],
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } },
            { category: { [Op.like]: `%${q}%` } },
            { language: { [Op.like]: `%${q}%` } }
          ]
        }
      }),
      Movie.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } },
            { ownerHistory: { [Op.like]: `%${q}%` } }
          ]
        }
      })
    ]);

    const separatedSql = separateVideos(videos);

    res.json({
      slokas: slokas.map(mapSloka),
      stories: stories.map(mapStory),
      videos: separatedSql.videos,
      reels: separatedSql.reels,
      movies: movies.map(mapMovie),
    });
  } catch (error) {
    if (String(error.message || '').toLowerCase().includes('no such column')) {
      return res.json(searchMockContent(String(req.query?.q || '').trim()));
    }

    res.status(500).json({ message: error.message });
  }
};
