const express = require('express');
const router = express.Router();
const { getMovies, addMovie, deleteMovie, updateMovie } = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getMovies);
router.post('/', protect, admin, addMovie);
router.patch('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);

module.exports = router;
