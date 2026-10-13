const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
const PORT = Number(process.env.REST_PORT || 3001);

app.use(cors());
app.use(express.json());

const sessions = new Map();
const npcs = new Map();

app.get('/api/health', (_, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.post('/api/session', (req, res) => {
  const { userId = 'guest', role = 'visitor' } = req.body || {};
  const token = randomUUID();
  const session = { userId, role, token, createdAt: Date.now() };
  sessions.set(token, session);
  res.json({ ok: true, session, token });
});

app.get('/api/sessions', (_, res) => {
  res.json({ ok: true, sessions: Array.from(sessions.values()) });
});

app.post('/api/npcs', (req, res) => {
  const {
    count = 1,
    sessionTag = 'default',
    vpnLocation = 'us-east',
    world = 'metaverse',
  } = req.body || {};

  const created = [];

  for (let i = 0; i < Number(count); i += 1) {
    const npcId = `npc-${sessionTag}-${Date.now()}-${i}`;
    const npc = {
      id: npcId,
      sessionTag,
      vpnLocation,
      world,
      status: 'created',
      connected: false,
      createdAt: Date.now(),
    };
    npcs.set(npcId, npc);
    created.push(npc);
  }

  res.json({ ok: true, created });
});

app.get('/api/npcs', (_, res) => {
  res.json({ ok: true, npcs: Array.from(npcs.values()) });
});

app.post('/api/npcs/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, connected } = req.body || {};
  const npc = npcs.get(id);

  if (!npc) {
    return res.status(404).json({ ok: false, error: 'NPC not found' });
  }

  if (typeof status !== 'undefined') npc.status = status;
  if (typeof connected !== 'undefined') npc.connected = connected;

  res.json({ ok: true, npc });
});

app.post('/api/npcs/:id/vpn', (req, res) => {
  const { id } = req.params;
  const { vpnLocation } = req.body || {};
  const npc = npcs.get(id);

  if (!npc) {
    return res.status(404).json({ ok: false, error: 'NPC not found' });
  }

  npc.vpnLocation = vpnLocation || npc.vpnLocation;
  res.json({ ok: true, npc });
});

app.delete('/api/npcs/:id', (req, res) => {
  const { id } = req.params;
  const removed = npcs.get(id);
  if (!removed) {
    return res.status(404).json({ ok: false, error: 'NPC not found' });
  }
  npcs.delete(id);
  res.json({ ok: true, removed });
});

app.listen(PORT, () => {
  console.log(`REST API listening on http://localhost:${PORT}`);
});
