const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerAdminSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const mentorSchema = Joi.object({
  type: Joi.string().valid('stress', 'fear', 'anger', 'confusion', 'motivation').required(),
  slokaText: Joi.string().required(),
  meaningSimple: Joi.string().required(),
  teluguExplanation: Joi.string().required(),
  realLifeGuidance: Joi.string().required(),
});

const videoSchema = Joi.object({
  title: Joi.string().required(),
  thumbnail: Joi.string().uri().required(),
  videoUrl: Joi.string().uri().required(),
  language: Joi.string().required(),
  category: Joi.string().required(),
  type: Joi.string().allow(null, ''),
  duration: Joi.string().allow(null, ''),
});

const chapterSchema = Joi.object({
  chapterNumber: Joi.number().integer().min(1).required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  backgroundImage: Joi.string().uri().required(),
});

const dailySlokaSchema = Joi.object({
  date: Joi.date().required(),
  slokaText: Joi.string().required(),
  meaning: Joi.string().required(),
  audioUrl: Joi.string().uri().required(),
});

module.exports = {
  loginSchema,
  registerAdminSchema,
  mentorSchema,
  videoSchema,
  chapterSchema,
  dailySlokaSchema,
};
