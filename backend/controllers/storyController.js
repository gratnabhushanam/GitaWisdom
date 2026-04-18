const { Story } = require('../models');
const mongoose = require('mongoose');
const StoryMongo = require('../models/mongo/StoryMongo');
const { Op } = require('sequelize');
const { mapStory } = require('../utils/responseMappers');


const { isMongoEnabled, isMongoConnected, useMongoStore } = require('../utils/mongoStore');

exports.getStories = async (req, res) => {
  try {


    if (useMongoStore()) {
      const stories = await StoryMongo.find({}).sort({ createdAt: -1 });
      return res.json(stories.map(mapStory));
    }

    const stories = await Story.findAll();
    res.json(stories.map(mapStory));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addStory = async (req, res) => {
  try {
    const primaryTitle = req.body.title
      || req.body.titleEnglish
      || req.body.titleHindi
      || req.body.titleTelugu
      || 'Untitled Story';

    const payload = {
      ...req.body,
      title: primaryTitle,
      seriesTitle: req.body.seriesTitle || 'Bhagavad Gita',
      bgmEnabled: req.body.bgmEnabled !== false,
      bgmPreset: req.body.bgmPreset || 'temple',
    };



    if (useMongoStore()) {
      const newStory = await StoryMongo.create(payload);
      return res.status(201).json(mapStory(newStory));
    }

    const newStory = await Story.create(payload);
    res.status(201).json(mapStory(newStory));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getKidsStories = async (req, res) => {
  try {


    if (useMongoStore()) {
      const stories = await StoryMongo.find({ tags: { $regex: 'kids', $options: 'i' } });
      return res.json(stories.map(mapStory));
    }

    const stories = await Story.findAll({
       where: {
          tags: {
             [Op.like]: '%kids%'
          }
       }
    });
    res.json(stories.map(mapStory));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;



    if (useMongoStore()) {
      const story = await StoryMongo.findById(String(id));
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      await story.deleteOne();
      return res.json({ message: 'Story deleted successfully', id: String(id) });
    }

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    await story.destroy();
    return res.json({ message: 'Story deleted successfully', id: Number(id) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;

    const incomingTitle = req.body.title
      || req.body.titleEnglish
      || req.body.titleHindi
      || req.body.titleTelugu;

    if (useMongoStore()) {
      const updatedData = {
        ...req.body,
        title: incomingTitle || req.body.title, // Use patched titles
        seriesTitle: req.body.seriesTitle || 'Bhagavad Gita',
        bgmEnabled: typeof req.body.bgmEnabled === 'boolean' ? req.body.bgmEnabled : true,
        bgmPreset: req.body.bgmPreset || 'temple',
      };

      const story = await StoryMongo.findByIdAndUpdate(
        String(id),
        { $set: updatedData },
        { new: true, runValidators: true }
      );
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      return res.json(mapStory(story));
    }

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    await story.update({
      ...req.body,
      title: incomingTitle || story.title,
      seriesTitle: req.body.seriesTitle || story.seriesTitle || 'Bhagavad Gita',
      bgmEnabled: typeof req.body.bgmEnabled === 'boolean' ? req.body.bgmEnabled : story.bgmEnabled !== false,
      bgmPreset: req.body.bgmPreset || story.bgmPreset || 'temple',
    });
    return res.json(mapStory(story));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
