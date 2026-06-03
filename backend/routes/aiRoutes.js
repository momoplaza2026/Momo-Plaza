const express = require('express');
const { getAiRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/recommend', protect, getAiRecommendations);

module.exports = router;
