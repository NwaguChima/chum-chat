const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoutes');
const messageRoute = require('./routes/messageRoutes');

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.use('/auth', userRoute);
app.use('/messages', messageRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

module.exports = app;
