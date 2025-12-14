
// hub/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple in-memory registry of connected bots (ws sockets)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const sockets = new Map(); // botId -> ws

wss.on('connection', function connection(ws, req) {
  ws.on('message', function incoming(message) {
    try {
      const msg = JSON.parse(message.toString());
      if (msg.type === 'register' && msg.botId) {
        sockets.set(msg.botId, ws);
        ws.botId = msg.botId;
        console.log('Registered bot', msg.botId);
      } else if (msg.type === 'event' && msg.botId) {
        // broadcast event to all clients as stream
        const payload = { from: msg.botId, event: msg.event, data: msg.data, ts: Date.now() };
        // send to all
        sockets.forEach((s, id) => {
          try { s.send(JSON.stringify({ type: 'stream_event', payload })); } catch(e){}
        });
      }
    } catch(e){
      console.error('Invalid message', e);
    }
  });

  ws.on('close', ()=>{
    if (ws.botId) {
      sockets.delete(ws.botId);
      console.log('Bot disconnected', ws.botId);
    }
  });
});

// HTTP API for orchestration: send command to a bot or broadcast
app.post('/send/:botId', (req, res) => {
  const botId = req.params.botId;
  const body = req.body || {};
  const ws = sockets.get(botId);
  if (!ws) return res.status(404).json({ error: 'bot not connected' });
  ws.send(JSON.stringify({ type: 'command', command: body.command, data: body.data || {} }));
  return res.json({ ok: true });
});

app.post('/broadcast', (req, res) => {
  const body = req.body || {};
  const cmd = body.command;
  sockets.forEach((s, id) => {
    try { s.send(JSON.stringify({ type: 'command', command: cmd, data: body.data || {} })); } catch(e){}
  });
  return res.json({ ok: true, sent: sockets.size });
});

app.get('/status', (req, res) => {
  return res.json({ connected: Array.from(sockets.keys()) });
});

const PORT = process.env.PORT || 4200;
server.listen(PORT, ()=> console.log('Parabot Hub listening on', PORT));
