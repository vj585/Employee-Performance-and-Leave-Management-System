const mongoose = require('mongoose');
/**
 * leaveController.js
 * Handles operations related to applying, approving, and viewing leaves.
 */
const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getWorkingDaysCount } = require('../utils/dateUtils');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new leave request
// @route   POST /api/leaves
// @access  Private
const createLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("Incoming Leave Request:", { ...req.body, supportDoc: req.body.supportDoc ? "PRESENT (length: " + req.body.supportDoc.length + ")" : "MISSING" });
    const { leaveType, startDate, endDate, reason, supportDoc } = req.body;
    
    // Calculate duration in days (inclusive) excluding weekends
    const duration = getWorkingDaysCount(startDate, endDate);

    const user = await User.findById(req.user._id).session(session);

    // Verify balance - handles legacy 'Casual' key if 'Personal' is missing
    const getBalance = (u, type) => {
      if (type === 'Personal') return u.leaveBalance?.Personal ?? u.leaveBalance?.Casual ?? 0;
      return u.leaveBalance?.[type] ?? 0;
    };

    const currentBalance = getBalance(user, leaveType);
    if (currentBalance < duration) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance. You requested ${duration} days, but only have ${currentBalance} left.` 
      });
    }

    // Deduct balance on application
    if (user.leaveBalance) {
      if (leaveType === 'Personal' && user.leaveBalance.Personal === undefined) {
        // Migration: transition existing Casual balance to Personal if needed
        user.leaveBalance.Casual = (user.leaveBalance.Casual || 0) - duration;
        user.markModified('leaveBalance');
      } else {
        const type = leaveType;
        const currentVal = user.leaveBalance[type] || 0;
        user.leaveBalance[type] = currentVal - duration;
        user.markModified('leaveBalance'); 
      }
      await user.save({ session });
    }

    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      supportDoc
    });

    const createdLeave = await leave.save({ session });

    const managers = await User.find({ role: { $in: ['Manager', 'Admin'] } }).session(session);
    const notificationPayload = managers.map(m => ({
      userId: m._id,
      message: `${user.name} actively filed a ${duration}-day ${leaveType} leave request.`
    }));
    await Notification.insertMany(notificationPayload, { session });

    // Fire emails asynchronously
    managers.forEach(m => {
      if(m.email) {
        sendEmail({
          email: m.email,
          subject: `New Leave Request Action Required: ${user.name}`,
          message: `${user.name} has submitted a ${duration}-day ${leaveType} leave request.\nReason: ${reason || 'Not provided'}\n\nPlease log into the HR portal to review and approve/reject this request.`
        });
      }
    });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(createdLeave);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private/Manager
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({}).populate('employee', 'name email department profileImage designation').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private/Manager
const updateLeaveStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, managerNotes } = req.body;
    const leave = await Leave.findById(req.params.id).session(session);

    if (leave) {
      // --- Leave Balance Reconciliation Logic ---
      const duration = getWorkingDaysCount(leave.startDate, leave.endDate);
      const user = await User.findById(leave.employee).session(session);

      if (user && user.leaveBalance) {
        // SCENARIO 1: Refunding balance when moving TO 'Rejected'
        if (status === 'Rejected' && leave.status !== 'Rejected') {
          if (leave.leaveType === 'Personal' && user.leaveBalance.Personal === undefined) {
             user.leaveBalance.Casual = (user.leaveBalance.Casual || 0) + duration;
          } else {
             user.leaveBalance[leave.leaveType] = (user.leaveBalance[leave.leaveType] || 0) + duration;
          }
        } 
        // SCENARIO 2: Re-deducting balance when moving OUT of 'Rejected'
        else if (status !== 'Rejected' && leave.status === 'Rejected') {
          const type = (leave.leaveType === 'Personal' && user.leaveBalance.Personal === undefined) ? 'Casual' : leave.leaveType;
          const currentBal = user.leaveBalance[type] || 0;
          
          if (currentBal < duration && status === 'Approved') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Insufficient ${type} leave balance to re-approve this request.` });
          }
          user.leaveBalance[type] = currentBal - duration;
        }
        
        user.markModified('leaveBalance');
        await user.save({ session });
      }
      // --- End Reconciliation Logic ---

      leave.status = status;
      if (managerNotes) leave.managerNotes = managerNotes;

      const updatedLeave = await leave.save({ session });

      // Transact status alert straight to originating employee dashboard
      await Notification.insertMany([{
        userId: leave.employee,
        message: `Your ${leave.leaveType} leave was officially ${status.toLowerCase()} by management.`
      }], { session });

      if (user && user.email) {
        sendEmail({
          email: user.email,
          subject: `Leave Request Assessed: ${status}`,
          message: `Your recent ${leave.leaveType} leave request has been evaluated and marked as: ${status.toUpperCase()}.\nManager Notes: ${managerNotes || 'N/A'}\n\nLog into your employee dashboard for full reporting.`
        });
      }

      await session.commitTransaction();
      session.endSession();
      res.json(updatedLeave);
    } else {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaves,
  getLeaves,
  updateLeaveStatus
};
