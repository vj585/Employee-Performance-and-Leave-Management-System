const express = require('express');
const router = express.Router();
const { 
  createEvaluation, 
  getMyEvaluations, 
  getEvaluations,
  getTeamLatestEvaluations 
} = require('../controllers/performanceController');
const { protect, manager } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, manager, createEvaluation)
  .get(protect, manager, getEvaluations);

router.route('/team-latest').get(protect, manager, getTeamLatestEvaluations);
router.route('/my-reviews').get(protect, getMyEvaluations);

module.exports = router;
