const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/profile', (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;

      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.create({
      username,
      password,
    });

    jwt.sign(
      { userId: user._id, username },
      process.env.JWT_SECRET,
      (err, token) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error signing token', error: err });
        }

        res
          .cookie('token', token, { sameSite: 'none', secure: true })
          .status(201)
          .json({
            id: user._id,
            message: 'User created successfully',
          });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

module.exports = router;
