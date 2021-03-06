const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');
const router = express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    if (req.query.type === 'all') {
      req.user.tokens = []
    } else {
      req.user.tokens = req.user.tokens.filter(tokenObj => {
        return tokenObj.token !== req.token;
      });
    }

    await req.user.save();

    res.status(200).send("Logged out successfully");
  } catch (e) {
    res.status(500).send(e);
  }
});

// @todo Create admin role for fetching users by id.
// router.get('/users/:id', auth, async (req, res) => {
//   const _id = req.params.id;
//
//   try {
//     const user = await User.findById(_id);
//
//     if (!user) {
//       return res.status(404).send();
//     }
//
//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// @todo Create admin role for updating users by id.
// router.patch('/users/:id', auth, async (req, res) => {
//   const { params, body } = req;
//   const validUpdateFields = ['name', 'email', 'age', 'password'];
//   const updateFields = Object.keys(req.body);
//   const isValidUpdate = updateFields.every(updField => validUpdateFields.includes(updField));
//
//   if (!isValidUpdate) return res.status(400).send({ error: 'Invalid field update' });
//
//   try {
//     // we dont use findByIdAndUpdate, because want to use middleware pre 'save'
//     const user = await User.findById(params.id);
//     updateFields.forEach(field => user[field] = body[field]);
//
//     await user.save();
//
//     if (!user) {
//       return res.status(404).send();
//     }
//
//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

router.patch('/users/me', auth, async (req, res) => {
  const validUpdateFields = ['name', 'email', 'age', 'password'];
  const updateFields = Object.keys(req.body);
  const isValidUpdate = updateFields.every(updField => validUpdateFields.includes(updField));

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid field update' });

  try {
    updateFields.forEach(field => req.user[field] = req.body[field]);

    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// @todo Create admin role for deleting users by id.
// router.delete('/users/:id', auth, async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//
//     if (!user) {
//       return res.status(404).send();
//     }
//
//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove(); // req.user is available because we defined it in user schema
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
