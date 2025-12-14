// bot03/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BOT_ID = 'bot03';
const HUB_WS = process.env.HUB_WS || 'ws://localhost:4200';
const OLLAMA_HTTP = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'; // local Ollama
const PORT = process.env.PORT || 4303;

const MEMORY_FILE = './memory.log.jsonl';
const fs = require('fs');
function memAppend(obj){ fs.appendFileSync(MEMORY_FILE, JSON.stringify(obj) + '\\n'); }

// connect to hub via websocket
const ws = new WebSocket(HUB_WS);
ws.on('open', ()=>{
  ws.send(JSON.stringify({ type: 'register', botId: BOT_ID }));
  console.log(BOT_ID, 'connected to hub');
});
ws.on('message', (msg)=>{
  try{
    const m = JSON.parse(msg.toString());
    if (m.type === 'command') {
      console.log(BOT_ID, 'received command', m.command);
      memAppend({ ts: Date.now(), direction: 'in', command: m.command, data: m.data });
      if (m.command === 'call' && m.data && m.data.target) {
        const target = m.data.target;
        const payload = m.data.payload || { from: BOT_ID, msg: 'Hello from ' + BOT_ID };
        const targetNum = parseInt(target.replace('bot','')) || 1;
        const targetPort = 4300 + targetNum;
        fetch('http://localhost:' + targetPort + '/api/message', {
          method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
        }).then(r=>r.text()).then(t=>{
          memAppend({ ts: Date.now(), direction: 'call_result', target, result: t });
          ws.send(JSON.stringify({ type: 'event', botId: BOT_ID, event: 'call_result', data: { target, result: t } }));
        }).catch(e=>{
          ws.send(JSON.stringify({ type: 'event', botId: BOT_ID, event: 'error', data: { error: String(e) } }));
        });
      }
    }
  }catch(e){ console.error('invalid hub message', e); }
});

app.post('/api/message', async (req, res) => {
  const body = req.body || {};
  memAppend({ ts: Date.now(), direction: 'inbound', from: body.from || 'external', payload: body });
  try {
    const prompt = body.prompt || ('Message to ' + BOT_ID + ': ' + JSON.stringify(body));
    const ollamaRes = await fetch(OLLAMA_HTTP + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3-70b', prompt: prompt, max_tokens: 256 })
    });
    const json = await ollamaRes.json().catch(()=>null);
    const text = (json && (json.text || (json[0] && json[0].generated_text))) ? (json.text || json[0].generated_text) : ('OK from ' + BOT_ID);
    memAppend({ ts: Date.now(), direction: 'outbound', reply: text });
    ws.send(JSON.stringify({ type: 'event', botId: BOT_ID, event: 'reply', data: { reply: text } }));
    res.json({ bot: BOT_ID, reply: text });
  } catch(e){
    memAppend({ ts: Date.now(), direction: 'error', error: String(e) });
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/status', (req, res) => { res.json({ bot: BOT_ID, port: PORT }); });

app.listen(PORT, ()=> console.log(BOT_ID + ' listening on ' + PORT));