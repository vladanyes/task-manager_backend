const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

const User = mongoose.model('User', new Schema({
  name: {
    type: String,
    required: true,
    trim: true,

  },
  email: {
    type: String,
    required: true,
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
  }
}));

module.exports = User;



