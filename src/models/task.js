const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Pointing relationships from task to the user model.
    // It can be accessible by await task.populate('owner').execPopulate();
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
