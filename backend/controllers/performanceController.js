const Performance = require('../models/Performance');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new performance evaluation
// @route   POST /api/performance
// @access  Private/Manager
const createEvaluation = async (req, res) => {
  try {
    const { userId, rating, technicalRating, leadershipRating, remarks, date } = req.body;
    
    const evalData = {
      userId,
      reviewerId: req.user._id,
      rating,
      technicalRating,
      leadershipRating,
      remarks
    };
    if (date) evalData.date = new Date(date);

    const performance = new Performance(evalData);
    const created = await performance.save();
    
    // Broadcast push notification to Employee
    await Notification.create({
      userId,
      message: `A new performance evaluation scoring ${rating}/5 has been securely published to your corporate record.`
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user evaluations
// @route   GET /api/performance/my-reviews
// @access  Private
const getMyEvaluations = async (req, res) => {
  try {
    const evals = await Performance.find({ userId: req.user._id })
      .populate('reviewerId', 'name designation profileImage')
      .sort({ date: -1, createdAt: -1 });
    res.json(evals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all evaluations
// @route   GET /api/performance
// @access  Private/Manager
const getEvaluations = async (req, res) => {
  try {
    const evals = await Performance.find({})
      .populate('userId', 'name department profileImage designation')
      .populate('reviewerId', 'name')
      .sort({ date: -1 });
    res.json(evals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get latest evaluations for all employees
// @route   GET /api/performance/team-latest
// @access  Private/Manager
const getTeamLatestEvaluations = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('name department email designation profileImage');
    const teamData = [];

    for (const emp of employees) {
      const latestReview = await Performance.findOne({ userId: emp._id }).sort({ date: -1 });
      teamData.push({
        employee: emp,
        latestRating: latestReview ? latestReview.rating : 'N/A',
        latestDate: latestReview ? latestReview.date : null
      });
    }

    res.json(teamData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvaluation,
  getMyEvaluations,
  getEvaluations,
  getTeamLatestEvaluations
};
