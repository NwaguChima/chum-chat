const ws = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

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

    connection.on('message', async (message) => {
      const decodedMessage = JSON.parse(message);
      let recipient = decodedMessage?.recipient;
      let messageData = decodedMessage?.textData;

      if (recipient && messageData) {
        const messageDoc = await Message.create({
          sender: connection.userId,
          recipient,
          text: messageData,
        });

        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(
                JSON.stringify({
                  textData: messageData,
                  sender: connection.userId,
                  recipient,
                  id: messageDoc._id,
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
