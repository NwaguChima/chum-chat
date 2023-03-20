const ws = require('ws');
const jwt = require('jsonwebtoken');

function handleSocket(server) {
  console.log('New connection');
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookieStr = cookies
        .split(';')
        .find((c) => c.trim().startsWith('token='));
      if (tokenCookieStr) {
        const token = tokenCookieStr.split('=')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
          if (err) {
            throw new Error('Invalid token');
          } else {
            const { userId, username } = decodedUser;

            connection.userId = userId;
            connection.username = username;
          }
        });
      }
    }
  });
}

module.exports = handleSocket;
