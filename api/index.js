const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/profile', (req, res) => {
  const { token } = res.cookie;

  jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
    if (err) throw err;

    res.json(userData);
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.create({
      username,
      password,
    });

    jwt.sign({ userId: user._id }, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Error signing token', error: err });
      }

      res.cookie('token', token).status(201).json({
        id: user._id,
        username,
        message: 'User created successfully',
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});
