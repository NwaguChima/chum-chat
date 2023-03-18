const ws = require('ws');

// websocket function exported
function handleSocket(server) {
  console.log('New connection');
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (conn, req) => {
    console.log('New connection');
    // wss.clients
  });
}

module.exports = handleSocket;