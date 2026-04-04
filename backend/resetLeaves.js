const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Leave = require('./models/Leave');

mongoose.connect(process.env.MONGO_URI);

const reset = async () => {
  console.log('Clearing all leaves...');
  await Leave.deleteMany({});
  
  console.log('Resetting all user leave balances to default...');
  await User.updateMany({}, {
    $set: {
      leaveBalance: {
        Annual: 20,
        Sick: 10,
        Personal: 7
      }
    }
  });
  
  console.log('✅ Leaves have been successfully reset to 0 and balances updated.');
  process.exit();
};

reset();
