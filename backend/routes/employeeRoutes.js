const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, updateProfileImage } = require('../controllers/employeeController');
const { protect, manager, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, manager, getEmployees)
  .post(protect, admin, createEmployee);

router.route('/:id')
  .get(protect, manager, getEmployeeById)
  .put(protect, admin, updateEmployee)
  .delete(protect, admin, deleteEmployee);

router.put('/profile/image', protect, updateProfileImage);

module.exports = router;
