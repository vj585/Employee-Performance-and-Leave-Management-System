const User = require('../models/User');

const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: 'Admin' } }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (employee) res.json(employee);
    else res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    let { name, email, password, role, department, designation } = req.body;
    
    // Admin restriction logic
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (normalizedEmail === 'vijaym0508@gmail.com') {
      role = 'Admin';
    } else if (role === 'Admin') {
      return res.status(403).json({ message: 'Not authorized to create an Admin.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({ name, email, password, role, department, designation });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      let newEmail = req.body.email || user.email;
      let newRole = req.body.role || user.role;
      
      const normalizedNewEmail = (newEmail || '').toLowerCase().trim();
      const normalizedCurrentEmail = (user.email || '').toLowerCase().trim();

      if (normalizedNewEmail === 'vijaym0508@gmail.com') {
        newRole = 'Admin';
      } else if (newRole === 'Admin' && normalizedCurrentEmail !== 'vijaym0508@gmail.com') {
        // Prevent upgrading a non-admin to admin
        return res.status(403).json({ message: 'Not authorized to assign Admin role.' });
      }

      user.name = req.body.name || user.name;
      user.email = newEmail;
      user.role = newRole;
      user.department = req.body.department || user.department;
      user.designation = req.body.designation || user.designation;
      if (req.body.leaveBalance) user.leaveBalance = req.body.leaveBalance;
      if (req.body.password) user.password = req.body.password;
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.profileImage = req.body.profileImage || '';
    await user.save();
    res.json({ message: 'Profile image updated successfully', profileImage: user.profileImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, updateProfileImage };
