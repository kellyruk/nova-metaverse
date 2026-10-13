const { WebSocket } = require('ws');
const { buildNpcBehavior } = require('./ai');

const serverUrl = process.env.SERVER_URL || 'ws://localhost:8081';
const npcCount = Number(process.env.NPC_COUNT || 1);
const sessionTag = process.env.SESSION_TAG || 'local';

for (let index = 0; index < npcCount; index += 1) {
  startNpc(index);
}

function startNpc(index) {
  const socket = new WebSocket(serverUrl);
  const npc = buildNpcBehavior(index, sessionTag);

  socket.on('open', () => {
    const payload = {
      type: 'join',
      id: `npc-${sessionTag}-${index}-${Date.now()}`,
      kind: 'npc',
      name: `NPC-${sessionTag}-${index}`,
      color: npc.color,
      x: npc.x,
      y: npc.y,
      z: npc.z,
      heading: npc.heading,
    };

    socket.send(JSON.stringify(payload));

    const interval = setInterval(() => {
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
    }, 180);

    socket.on('close', () => {
      clearInterval(interval);
      console.log(`NPC ${sessionTag}-${index} disconnected`);
    });
  });

  socket.on('error', (error) => {
    console.error(`NPC ${sessionTag}-${index} websocket error:`, error.message);
  });
}
