const mongoose = require('mongoose');
const handleSocket = require('./controllers/socket');
require('dotenv').config();

const app = require('./index');

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

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log('Server listening on port 4000');
});

handleSocket(server);
