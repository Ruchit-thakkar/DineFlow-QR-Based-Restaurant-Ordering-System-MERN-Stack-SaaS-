const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

router.post('/', reviewController.createReview); // No auth needed
router.get('/', authMiddleware, reviewController.getReviews);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
