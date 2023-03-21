const ws = require('ws');
const jwt = require('jsonwebtoken');

function handleSocket(server) {
  console.log('New connection');
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (connection, req) => {
    // Get user from token
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

    connection.on('message', (message) => {
      const decodedMessage = JSON.parse(message);
      let recipient = decodedMessage?.recipient;
      let messageData = decodedMessage?.textData;

      if (recipient && messageData) {
        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(
                JSON.stringify({
                  textData: messageData,
                  sender: connection.userId,
                })
              );
            }
          });
      }
    });

    // Notify all clients about new user online
    [...wss.clients].forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(
          JSON.stringify({
            online: [...wss.clients].map((c) => ({
              username: c.username,
              userId: c.userId,
            })),
          })
        );
      }
    });
  });
}

module.exports = handleSocket;
