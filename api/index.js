const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(err);
});

const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('./register', (req, res) => {});

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});
