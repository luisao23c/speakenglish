const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const curriculum = require('./curriculum');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
} catch (e) {}

const PORT = process.env.PORT || 4500;
const BASE_URL = process.env.BASE_URL || ('http://localhost:' + PORT);

app.use(express.json({ limit: '2mb' }));

var _rateLimit = {};
function rateLimit(maxPerMin) {
  return function (req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = ip + ':' + req.path;
    if (!_rateLimit[key]) _rateLimit[key] = [];
    _rateLimit[key] = _rateLimit[key].filter(t => now - t < 60000);
    if (_rateLimit[key].length >= maxPerMin) return res.status(429).json({ error: 'Demasiadas peticiones. Intenta en 1 minuto.' });
    _rateLimit[key].push(now);
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const k in _rateLimit) {
    _rateLimit[k] = _rateLimit[k].filter(t => now - t < 60000);
    if (!_rateLimit[k].length) delete _rateLimit[k];
  }
}, 300000);

// ================= BOT DE INGLÉS (Maya) =================
function getOrKeys() {
  const extra = (process.env.OPENROUTER_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  const one = (process.env.OPENROUTER_API_KEY || '').trim();
  const arr = [];
  if (extra.length) arr.push(...extra);
  if (one) arr.push(one);
  const seen = new Set();
  return arr.filter(k => (seen.has(k) ? false : (seen.add(k), true)));
}
function getProviders() {
  const zenKey = (process.env.ZEN_API_KEY || '').trim();
  const orKeys = getOrKeys();
  const providers = [];
  if (zenKey) providers.push({ name: 'zen', url: 'https://opencode.ai/zen/v1/chat/completions', keys: [zenKey], models: ['mimo-v2.5-free', 'nemotron-3.5-lightning-free', 'nemotron-3-ultra-free'] });
  if (orKeys.length) providers.push({ name: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions', keys: orKeys, models: [process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.7:free', 'minimax/minimax-m2.7:free', 'google/gemma-4-31b-it:free'] });
  return providers;
}
const PROVIDERS = getProviders();
let _provIdx = 0;

const LEVELS = [
  { id: 'A0', name: 'A0 · Principiante', need: 0 },
  { id: 'A1', name: 'A1 · Básico', need: 200 },
  { id: 'A2', name: 'A2 · Elemental', need: 600 },
  { id: 'B1', name: 'B1 · Intermedio', need: 1500 },
  { id: 'B2', name: 'B2 · Intermedio+', need: 3000 },
  { id: 'C1', name: 'C1 · Avanzado', need: 1200 }
];
function levelInfo(xp) {
  let cur = LEVELS[0], nxt = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].need) { cur = LEVELS[i]; nxt = LEVELS[i + 1] || null; }
  }
  const pct = nxt ? Math.min(100, Math.round(((xp - cur.need) / (nxt.need - cur.need)) * 100)) : 100;
  return { level: cur.id, levelName: cur.name, nextLevel: nxt ? nxt.id : null, need: nxt ? nxt.need : cur.need, xp, pct };
}
function getLearner(id) {
  if (!id) return null;
  id = String(id).slice(0, 80);
  let l = db.prepare('SELECT * FROM learners WHERE id = ?').get(id);
  if (!l) {
    db.prepare('INSERT INTO learners (id) VALUES (?)').run(id);
    l = db.prepare('SELECT * FROM learners WHERE id = ?').get(id);
  }
  return l;
}
function touchActive(l) {
  const today = new Date().toISOString().slice(0, 10);
  if (l.last_active === today) return l;
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const streak = l.last_active === yesterday ? (Number(l.streak) || 0) + 1 : 1;
  db.prepare('UPDATE learners SET last_active = ?, streak = ? WHERE id = ?').run(today, streak, l.id);
  return Object.assign({}, l, { last_active: today, streak });
}
function grantXp(l, amount) {
  const before = levelInfo(l.xp);
  const xp = (Number(l.xp) || 0) + amount;
  const after = levelInfo(xp);
  const leveled = before.level !== after.level;
  db.prepare('UPDATE learners SET xp = ?, total_msg = total_msg + 1, level = ? WHERE id = ?').run(xp, after.level, l.id);
  l = Object.assign({}, l, { xp, total_msg: (Number(l.total_msg) || 0) + 1, level: after.level });
  return { learner: l, leveled, from: before.level, to: after.level };
}

function evaluateLearner(learner, recent) {
  const sys =
    `Eres la coordinadora académica del curso de inglés. Recibes el historial de una sesión corta del alumno y devuelves SOLO JSON válido con esta forma exacta:
{"level":"A0|A1|A2|B1|B2|C1","errors":[{"said":"frase con error","fixed":"frase corregida","tip":"explicación en 1 línea en español"}],"vocab":["3-5 palabras que usó bien"],"summary":"2 frases en español: qué dominó y qué repasar"}
Nivel actual del alumno: ${learner.level}. Elige level según su desempeño real (puede mantenerse, subir o bajar). Máximo 4 errores.`;
  return callOpenRouter([{ role: 'system', content: sys }].concat(recent.slice(-14)), 0.2, 400)
    .then(raw => {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return null;
      const o = JSON.parse(m[0]);
      db.prepare('UPDATE learners SET errors = ?, vocab = ?, summary = ? WHERE id = ?')
        .run(JSON.stringify((o.errors || []).slice(0, 4)), JSON.stringify((o.vocab || []).slice(0, 8)), o.summary || '', learner.id);
      return o;
    })
    .catch(() => null);
}


// Use curriculum module (220 levels)
const LEVEL_PATH = curriculum.LEVEL_PATH;
const EXAMS = curriculum.EXAMS;
const CERT_EXAMS = curriculum.CERT_EXAMS;
const getLevelInfo = curriculum.getLevelInfo;

function getLesson(learner) {
  var currentLvl = null;
  try {
    var path = getLevelPath(learner.id);
    for (var i = 0; i < path.length; i++) {
      if (path[i].status !== 'completed') { currentLvl = LEVEL_PATH.find(function(l){return l.id===path[i].id;}); break; }
    }
  } catch(e) {}
  if (currentLvl) return { id: currentLvl.id, title: currentLvl.title, vocab: currentLvl.vocab || [] };
  return { id: 220, title: 'Dominio total', vocab: [] };
}

function getLevelPath(userId) {
  var result = [];
  for (var i = 0; i < LEVEL_PATH.length; i++) {
    var lvl = LEVEL_PATH[i];
    var userLevel = db.prepare('SELECT * FROM user_levels WHERE user_id = ? AND level_id = ?').get(userId, lvl.id);
    result.push({
      id: lvl.id,
      title: lvl.title,
      desc: lvl.desc,
      type: lvl.type,
      status: userLevel ? userLevel.status : (i === 0 ? 'available' : 'locked'),
      xp: userLevel ? userLevel.xp_earned : 0,
      score: userLevel ? userLevel.best_score : 0,
      attempts: userLevel ? userLevel.attempts : 0
    });
  }
  return result;
}

function getCurrentLevel(userId) {
  // Find the first level that's not completed
  for (var i = 0; i < LEVEL_PATH.length; i++) {
    var lvl = LEVEL_PATH[i];
    var userLevel = db.prepare('SELECT * FROM user_levels WHERE user_id = ? AND level_id = ?').get(userId, lvl.id);
    if (!userLevel || userLevel.status !== 'completed') {
      // Unlock this level
      if (!userLevel) {
        db.prepare('INSERT OR IGNORE INTO user_levels (user_id, level_id, status) VALUES (?, ?, ?)').run(userId, lvl.id, i === 0 ? 'available' : 'locked');
      }
      return lvl;
    }
  }
  return LEVEL_PATH[LEVEL_PATH.length - 1]; // All completed
}

function completeLevel(userId, levelId, score) {
  var lvl = LEVEL_PATH.find(function(l) { return l.id === levelId; });
  if (!lvl) return null;
  
  var existing = db.prepare('SELECT * FROM user_levels WHERE user_id = ? AND level_id = ?').get(userId, levelId);
  if (!existing) {
    db.prepare('INSERT INTO user_levels (user_id, level_id, status, xp_earned, attempts, best_score, completed_at) VALUES (?, ?, ?, ?, 1, ?, datetime("now"))').run(userId, levelId, 'completed', lvl.xpNeeded, score);
  } else {
    var newBest = Math.max(existing.best_score || 0, score);
    db.prepare('UPDATE user_levels SET status = ?, xp_earned = ?, attempts = attempts + 1, best_score = ?, completed_at = datetime("now") WHERE user_id = ? AND level_id = ?').run('completed', lvl.xpNeeded, newBest, userId, levelId);
  }
  
  // Unlock next level
  var nextId = levelId + 1;
  var nextLvl = LEVEL_PATH.find(function(l) { return l.id === nextId; });
  if (nextLvl) {
    var nextExisting = db.prepare('SELECT * FROM user_levels WHERE user_id = ? AND level_id = ?').get(userId, nextId);
    if (!nextExisting) {
      db.prepare('INSERT INTO user_levels (user_id, level_id, status) VALUES (?, ?, ?)').run(userId, nextId, 'available');
    } else if (nextExisting.status === 'locked') {
      db.prepare('UPDATE user_levels SET status = ? WHERE user_id = ? AND level_id = ?').run('available', userId, nextId);
    }
  }
  
  // Update learner XP
  var learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(userId);
  if (learner) {
    var newXp = (Number(learner.xp) || 0) + lvl.xpNeeded;
    db.prepare('UPDATE learners SET xp = ? WHERE id = ?').run(newXp, userId);
  }
  
  return { level: lvl, nextLevel: nextLvl };
}

function buildMayaPrompt(learner) {
  const name = learner.name || "Alguien";
  const errors = JSON.parse(learner.errors || "[]").slice(0, 5).map(e => (e.said || "") + " -> " + (e.fixed || "")).join(" | ") || "Ninguno";
  const vocab = JSON.parse(learner.vocab || "[]").slice(0, 15).join(", ") || "Ninguno";
  const msgCount = Number(learner.total_msg) || 0;
  const level = learner.level || "A0";
  
  // Get current level from path
  var currentLvl = null;
  try {
    var path = getLevelPath(learner.id);
    for (var i = 0; i < path.length; i++) {
      if (path[i].status !== "completed") { currentLvl = LEVEL_PATH.find(function(l){return l.id===path[i].id;}); break; }
    }
  } catch(e) {}
  
  var levelInfoStr = currentLvl ?
    "NIVEL #" + currentLvl.id + " - " + currentLvl.title + " (" + currentLvl.stage + ")" + String.fromCharCode(10) +
    "Tema: " + currentLvl.desc + String.fromCharCode(10) +
    "Categoria: " + (currentLvl.category || "General") + String.fromCharCode(10) +
    "Vocabulario clave: " + (currentLvl.vocab && currentLvl.vocab.length ? currentLvl.vocab.join(", ") : "Conversacion libre") + String.fromCharCode(10) +
    (currentLvl.type === "exam" ? "MODO EXAMEN: Evalua sin ensenar nada nuevo. Haz 3-5 preguntas sobre los ultimos 10 niveles." : "") +
    (currentLvl.type === "vocab" ? "MODO CLASE: Ensenia este tema. Habla y ensena, no escribas listas." : "")
    : "Continua con la siguiente leccion.";

  
  return `Eres Maya, la maestra y amiga bilingue de ${name}. Estan en una videollamada cara a cara.

PRIORIDAD ABSOLUTA: HABLAR. Todo debe terminar en produccion oral.
No puedes evaluar pronunciacion por texto, pero si puedes hacer que hable.

DATOS DEL ALUMNO:
- Nombre: ${name}
- Nivel: ${level}
- Mensajes: ${msgCount}
- Errores recientes: ${errors}
- Vocabulario: ${vocab}

NIVEL ACTUAL:
${levelInfoStr}

COMO ENSEñAR CADA NIVEL:
1. OBJETIVO: Explica que podra hacer oralmente al terminar.
2. VOCABULARIO ACTIVO: Ensenia palabras en frases completas, no sueltas.
   Ejemplo: "I am happy" no solo "happy = feliz".
3. MODELO CONVERSACIONAL: Muestra un dialogo breve y natural.
4. PRONUNCIACION: Senala sonidos dificiles, contracciones, ritmo.
5. PRACTICA: Haz preguntas y que responda usando el vocabulario.
6. JUEGO DE ROL: Simula una situacion real (restaurante, tienda, etc).
7. PRODUCCION LIBRE: Que hable sin guion durante un momento.
8. CORRECCION: Primero deja terminar, despues corrige los errores importantes.
9. REPITE: Que intente de nuevo con las correcciones.

REGLAS CRITICAS:
- SIEMPRE ensena en ingles, traduce solo lo necesario.
- Mensajes CORTOS (4-6 lineas maximo).
- NUNCA des listas largas de vocabulario.
- SIEMPRE termina con algo que HABLE el alumno.
- Si es examen: evalua sin ensenar, solo preguntas.
- Si dice "no se nada", empieza desde cero sin presion.
- No uses simbolos raros (solo texto plano).
- Envia respuestas que suenen naturales, como amiga hablando.

CORRECCION ORAL:
Cuando corrijas, hazlo asi:
"Oye, eso dijiste bien pero mejor dile asi: [frase mejorada]. A ver, repite."

MAXIMO 6 lineas por respuesta. Menos es mas.
`;
}


function cleanReply(text) {
  if (!text) return text;
  var lines = text.split(String.fromCharCode(10));
  var skipWords = ['Analysis','Strategy','Draft','Constraint','Student','Step','Rule','Context','Teach','Model','Priority','Topic','Key Vocab','Category','Grade','Grade Level'];
  var lastMeaningful = '';
  for (var i = lines.length - 1; i >= 0; i--) {
    var line = lines[i].trim();
    if (line.length > 10 && !line.startsWith('**') && !line.startsWith('*')) {
      var skip = false;
      for (var w = 0; w < skipWords.length; w++) {
        if (line.indexOf(skipWords[w]) === 0) { skip = true; break; }
      }
      if (!skip) { lastMeaningful = line; break; }
    }
  }
  if (lastMeaningful && lastMeaningful.length < text.length * 0.7) {
    return lastMeaningful;
  }
  return text.trim();
}

async function callOpenRouter(msgs, temp, tok) {
  if (!PROVIDERS.length) throw new Error('No API key');
  var lastErr = '';
  for (var pa = 0; pa < PROVIDERS.length; pa++) {
    var pv = PROVIDERS[(_provIdx++) % PROVIDERS.length];
    for (var ka = 0; ka < pv.keys.length; ka++) {
      var k = pv.keys[ka % pv.keys.length];
      for (var mo = 0; mo < pv.models.length; mo++) {
        try {
          var ctrl = new AbortController();
          var ti = setTimeout(function () { ctrl.abort(); }, 45000);
          var r = await fetch(pv.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + k, 'HTTP-Referer': BASE_URL },
            body: JSON.stringify({ model: pv.models[mo], messages: msgs, temperature: temp, max_tokens: tok }),
            signal: ctrl.signal
          });
          clearTimeout(ti);
          if (!r.ok) { lastErr = pv.name + '/' + pv.models[mo] + ' ' + r.status; continue; }
          var j = await r.json();
          var t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
          if (t) return cleanReply(t);
          lastErr = 'empty response';
        } catch (e) {
          lastErr = e.name === 'AbortError' ? 'timeout' : String(e.message || e);
        }
      }
    }
  }
  throw new Error('IA offline (' + lastErr + ')');
}

// ===== ROUTES =====
app.get('/api/health', function(r, s) {
  var providers = PROVIDERS.map(function(p) { return { name: p.name, models: p.models.length }; });
  s.json({ status: 'ok', providers: providers, providerCount: PROVIDERS.length });
});

app.get('/',function(r,s){s.redirect('/ingles')});
app.get('/ingles',function(r,s){s.set('Cache-Control','no-store');s.render('ingles',{hasKey:PROVIDERS.length>0})});
app.get('/api/ingles/me',rateLimit(30),function(r,s){var l=getLearner(r.query.id);if(!l)return s.json(null);var kv={id:l.id,name:l.name,streak:Number(l.streak)||0,total_msg:Number(l.total_msg)||0,voice_msg:Number(l.voice_msg)||0,errors:JSON.parse(l.errors||'[]'),vocab:JSON.parse(l.vocab||'[]'),summary:l.summary,goals:l.goals};Object.assign(kv,levelInfo(l.xp));try{var ls=getLesson(l);kv.lesson=ls.id==='conversation'?'Platica libre':ls.title;}catch(e){}s.json(kv);});
app.post('/api/ingles/chat',rateLimit(40),async function(r,s){var body=r.body||{};var msgs=Array.isArray(body.messages)?body.messages.filter(function(m){return m&&typeof m.content==='string'&&m.content.trim()}).slice(-20):[];if(!msgs.length)return s.status(400).json({error:'Sin mensaje'});if(!PROVIDERS.length)return s.status(503).json({error:'No API key'});var sid=String(body.id||'').slice(0,80);var l0=getLearner(sid);var lr=touchActive(l0);if(body.name)db.prepare('UPDATE learners SET name=? WHERE id=?').run(String(body.name).slice(0,30),lr.id);var user=msgs.slice().reverse().find(function(m){return m.role==='user'})||{content:''};var isV=/^🎤/.test(user.content);if(isV)db.prepare('UPDATE learners SET voice_msg=voice_msg+1 WHERE id=?').run(lr.id);try{var prompt=[{role:'system',content:buildMayaPrompt(lr)}].concat(msgs.slice(-14));var reply=cleanReply(await callOpenRouter(prompt,0.75,620));var hc=/❌/.test(reply);var base=isV?15:10;var xp=hc?Math.max(5,base-3):base+5;var g=grantXp(lr,xp);lr=g.learner;var kv={reply:reply,profile:{level:g.to,leveled:g.leveled,from:g.from,streak:Number(lr.streak)||0,total_msg:Number(lr.total_msg)||0,errorsCount:JSON.parse(lr.errors||'[]').length}};Object.assign(kv.profile,levelInfo(lr.xp));s.json(kv);if((Number(lr.total_msg)||0)%6===0)evaluateLearner(lr,msgs);}catch(e){s.status(502).json({error:(e.message.indexOf('IA offline')>=0?'Todos los modelos IA offline. Revisa tu API key en Render.':e.message.indexOf('No API key')>=0?'No hay API key. Agrega ZEN_API_KEY en Render.':'Maya error: '+e.message)});}});
app.post('/api/ingles/evaluar',rateLimit(10),async function(r,s){var l=getLearner(r.body&&r.body.id);if(!l)return s.status(400).json({error:'sin alumno'});var msgs=(Array.isArray(r.body.messages)?r.body.messages:[]).slice(-20);try{var o=await evaluateLearner(l,msgs)||{error:'no eval'};s.json(o);}catch(e){
    console.error('[MAYA ERROR] Eval failed:', e.message);
    s.status(502).json({error:String(e.message||e)});
  }});
app.get('/api/levels/path',rateLimit(30),function(r,s){var uid=String(r.query.id||'').slice(0,80);if(!uid)return s.status(400).json({error:'id required'});getLearner(uid);s.json({path:getLevelPath(uid),current:getCurrentLevel(uid).id});});
app.get('/api/levels/current',rateLimit(30),function(r,s){var uid=String(r.query.id||'').slice(0,80);if(!uid)return s.status(400).json({error:'id required'});var cur=getCurrentLevel(uid);var lr=getLearner(uid);s.json({level:cur,learner:{level:lr.level,xp:lr.xp}});});
app.post('/api/levels/complete',rateLimit(10),function(r,s){var uid=String(r.body.id||'').slice(0,80);var lid=Number(r.body.levelId);var sc=Number(r.body.score)||0;if(!uid||!lid)return s.status(400).json({error:'params required'});var res=completeLevel(uid,lid,sc);if(!res)return s.status(400).json({error:'invalid'});s.json(res);});

app.listen(PORT, function() { console.log('Maya en http://localhost:' + PORT); });
