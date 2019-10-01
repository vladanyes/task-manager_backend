const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      }
    }
  ]
});

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

// Hashing password before saving for better secure
userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;



