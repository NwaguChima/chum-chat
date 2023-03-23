const ws = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const fs = require('fs');

function handleSocket(server) {
  console.log('New connection');
  const wss = new ws.WebSocketServer({ server });

  function notifyAboutOnlinePeople() {
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
  }

  wss.on('connection', (connection, req) => {
    connection.isAlive = true;

    connection.timer = setInterval(() => {
      connection.ping();

      connection.deathTimer = setTimeout(() => {
        if (connection.isAlive) {
          connection.isAlive = false;

          clearInterval(connection.timer);
          connection.terminate();
          notifyAboutOnlinePeople();
        }
      }, 1000);
    }, 5000);

    connection.on('pong', () => {
      clearTimeout(connection.deathTimer);
    });

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
      let messageData = decodedMessage?.text;
      let file = decodedMessage?.file;
      let filename = null;

      if (file?.data) {
        const parts = file.name.split('.');
        const extension = parts[parts.length - 1];

        filename = `${Date.now()}.${extension}`;
        const path = __dirname + `/../uploads/${filename}`;

        const bufferData = Buffer.from(file?.data.split(',')[1], 'base64');

        fs.writeFile(path, bufferData, 'base64', (err) => {
          console.log('File saved:', path);
        });
      }

      if (recipient && (messageData || file?.data)) {
        const messageDoc = await Message.create({
          sender: connection.userId,
          recipient,
          text: messageData,
          file: file.data ? filename : null,
        });

        [...wss.clients]
          .filter((client) => client.userId === recipient)
          .forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(
                JSON.stringify({
                  text: messageData,
                  sender: connection.userId,
                  recipient,
                  file: file?.data ? filename : null,
                  _id: messageDoc._id,
                })
              );
            }
          });
      }
    });

    // Notify all clients about new user online
    notifyAboutOnlinePeople();
  });

  wss.on('close', (data) => {
    console.log('Connection closed', data);
  });
}

module.exports = handleSocket;
