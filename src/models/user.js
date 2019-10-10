const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,

  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: 'Email is not valid'
    }
  },
  age: {
    type: Number
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate: {
      validator: (value) => {
        return value;
      },
      message: 'Too simple password'
    }
  },
  // saving all tokens from all devices that be logged in
  tokens: [
    {
      token: {
        type: String,
        required: true,
      }
    }
  ]
});

// Using mongoose virtuals, you can define more sophisticated relationships between documents(i.e. user and task)
// It can be accessible via await user.populate('tasks').execPopulate(); user.tasks;
userSchema.virtual('tasks', {
  ref: 'Task', // The model to use/reference
  localField: '_id', // Find user where `localField`
  foreignField: 'owner' // is equal to `foreignField`
});

// Customizing toJSON method, which will be called automatically for object in res.send(Obj)
userSchema.methods.toJSON = function() {
  const user = this; 
  const userObj = user.toObject(); 

  delete userObj.tokens; 
  delete userObj.password; 

  return userObj;
};

// Generating authentication token
userSchema.methods.generateAuthToken = async function() {
  const user = this;

  const token = jwt.sign({_id: user._id.toString()}, 'thisismytaskmanager');
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Compare user credential while logging in
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await User.findOne({ email });

  if (!user) throw new Error('Unable to login');

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error('Unable to login');

  return user;

};

// Hash password before saving for better secure
userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
  const user = this;

  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;



