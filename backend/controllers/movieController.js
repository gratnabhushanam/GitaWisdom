const { Movie } = require('../models');
const mongoose = require('mongoose');
const { isMongoEnabled, isMongoConnected, useMongoStore } = require('../utils/mongoStore');
const MovieMongo = require('../models/mongo/MovieMongo');
const { mapMovie } = require('../utils/responseMappers');


exports.getMovies = async (req, res) => {
  try {


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
