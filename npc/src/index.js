const { WebSocket } = require('ws');
const { buildNpcBehavior } = require('./ai');

const serverUrl = process.env.SERVER_URL || 'ws://localhost:8081';
const npcCount = Number(process.env.NPC_COUNT || 1);

for (let index = 0; index < npcCount; index += 1) {
  startNpc(index);
}

function startNpc(index) {
  const socket = new WebSocket(serverUrl);
  const npc = buildNpcBehavior(index);

  socket.on('open', () => {
    const payload = {
      type: 'join',
      id: `npc-${index}-${Date.now()}`,
      kind: 'npc',
      name: `NPC-${index}`,
      color: npc.color,
      x: npc.x,
      y: npc.y,
      z: npc.z,
      heading: npc.heading,
    };
    socket.send(JSON.stringify(payload));

    setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) return;

      const next = npc.step();
      socket.send(JSON.stringify({
        type: 'move',
        id: payload.id,
        kind: 'npc',
        name: payload.name,
        color: npc.color,
        x: next.x,
        y: next.y,
        z: next.z,
        heading: next.heading,
      }));
    }, 150);
  });

  socket.on('message', (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed.type === 'pong') {
        // no-op: keepalive acknowledgement
      }
    } catch (error) {
      console.error('NPC message parse error:', error);
    }
  });

  socket.on('close', () => {
    console.log(`NPC ${index} disconnected`);
  });

  socket.on('error', (error) => {
    console.error(`NPC ${index} websocket error:`, error.message);
  });
}
