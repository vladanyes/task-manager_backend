const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/users/:id', async (req, res) => {
  const { params, body } = req;
  const validUpdateFields = ['name', 'email', 'age', 'password'];
  const updateFields = Object.keys(req.body);
  const isValidUpdate = updateFields.every(updField => validUpdateFields.includes(updField));

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid field update' });

  try {
    const user = await User.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;