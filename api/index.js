const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const jwt = require('jsonwebtoken');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('./register', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.create({
    username,
    password,
  });

  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, (err, token) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Error signing token', error: err });
    }

    res
      .cookie('token', token)
      .sendStatus(201)
      .json({ message: 'User created successfully' });
  });
});

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});
