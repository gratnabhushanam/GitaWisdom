const { Movie } = require('../models');
const mongoose = require('mongoose');
const MovieMongo = require('../models/mongo/MovieMongo');
const { mapMovie } = require('../utils/responseMappers');
const mockContentStore = require('../utils/mockContentStore');
const { isMockMode } = require('./authController');

const isMongoEnabled = String(process.env.USE_MONGODB || 'false').toLowerCase() === 'true';
const isMongoConnected = () => mongoose.connection && mongoose.connection.readyState === 1;
const useMongoStore = () => isMongoEnabled && isMongoConnected();

exports.getMovies = async (req, res) => {
  try {
    if (isMockMode()) {
      return res.json(mockContentStore.listMovies().map(mapMovie));
    }

    if (useMongoStore()) {
      const movies = await MovieMongo.find({}).sort({ releaseYear: -1, createdAt: -1 });
      return res.json(movies.map(mapMovie));
    }

    const movies = await Movie.findAll({
      order: [['releaseYear', 'DESC']]
    });
    res.json(movies.map(mapMovie));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMovie = async (req, res) => {
  try {
    if (isMockMode()) {
      const newMovie = mockContentStore.addMovie(req.body);
      return res.status(201).json(mapMovie(newMovie));
    }

    if (useMongoStore()) {
      const newMovie = await MovieMongo.create(req.body);
      return res.status(201).json(mapMovie(newMovie));
    }

    const newMovie = await Movie.create(req.body);
    res.status(201).json(mapMovie(newMovie));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMockMode()) {
      const removedMovie = mockContentStore.deleteMovie(id);
      if (!removedMovie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      return res.json({ message: 'Movie deleted successfully', id: removedMovie.id });
    }

    if (useMongoStore()) {
      const movie = await MovieMongo.findById(String(id));
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      await movie.deleteOne();
      return res.json({ message: 'Movie deleted successfully', id: String(id) });
    }

    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.destroy();
    return res.json({ message: 'Movie deleted successfully', id: Number(id) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
