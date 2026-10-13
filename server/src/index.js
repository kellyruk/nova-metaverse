const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8081);
const server = new WebSocketServer({ port: PORT });
const clients = new Map();

function broadcast() {
  const payload = {
    type: 'world-state',
    players: Array.from(clients.values()).map((player) => ({
      id: player.id,
      kind: player.kind,
      x: Number(player.x),
      y: Number(player.y),
      z: Number(player.z),
      name: player.name,
      color: player.color,
      heading: player.heading,
    })),
    tick: Date.now(),
  };

  for (const socket of clients.keys()) {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(payload));
    }
  }
}

function createPlayerFromMessage(socket, message) {
  const base = {
    id: message.id || `player-${Math.random().toString(16).slice(2, 10)}`,
    kind: message.kind || 'user',
    name: message.name || 'Guest',
    color: message.color || '#7fe9ff',
    x: Number(message.x || 0),
    y: Number(message.y || 0),
    z: Number(message.z || 0),
    heading: Number(message.heading || 0),
  };

  clients.set(socket, base);
  socket.send(JSON.stringify({ type: 'welcome', id: base.id }));
}

server.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === 'join') {
        createPlayerFromMessage(socket, message);
        broadcast();
        return;
      }

      if (message.type === 'move') {
        const player = clients.get(socket);
        if (!player) return;

        player.x = Number(message.x || player.x);
        player.y = Number(message.y || player.y);
        player.z = Number(message.z || player.z);
        player.heading = Number(message.heading || player.heading);
        broadcast();
        return;
      }

      if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      }
    } catch (error) {
      console.error('Message parse error:', error);
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    console.log('Client disconnected');
    broadcast();
  });
});

server.on('listening', () => {
  console.log(`Multiplayer server listening on ws://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

setInterval(() => {
  broadcast();
}, 50);
