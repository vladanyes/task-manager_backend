const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/tasks', auth, async (req, res) => {
  try {
    await req.user.populate('tasks').execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task)
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const { params, body } = req;
  const validUpdateFields = ['description', 'completed'];
  const updateFields = Object.keys(req.body);
  const isValidUpdate = updateFields.every(updField => validUpdateFields.includes(updField));
  const filter = { _id: params.id, owner: req.user._id };
  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid field update' });

  try {
    const task = await Task.findOneAndUpdate(filter, body, { new: true, runValidators: true });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  const filter = { _id: req.params.id, owner: req.user._id };
  try {
    const task = await Task.findOneAndDelete(filter);

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;

