/**
 * leaveRoutes.js
 * Defines API endpoints for all leave-related transactions.
 */
const express = require('express');
const router = express.Router();
const { createLeaveRequest, getMyLeaves, getLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, manager } = require('../middleware/authMiddleware');

router.route('/').post(protect, createLeaveRequest).get(protect, manager, getLeaves);
router.route('/my-leaves').get(protect, getMyLeaves);
router.route('/:id/status').put(protect, manager, updateLeaveStatus);

module.exports = router;
