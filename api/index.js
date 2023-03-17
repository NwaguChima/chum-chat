const express = require('express');

const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});
