const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'codes.json');

// Pastikan folder data wujud
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
// Pastikan fail data wujud
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ codes: [] }, null, 2));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Util data
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const json = JSON.parse(raw);
    if (!json.codes) json.codes = [];
    return json;
  } catch (e) {
    return { codes: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function cleanupExpired() {
  const data = loadData();
  const now = Date.now();
  // Kita simpan semua, tapi 'status' dikira masa GET (untuk log sejarah)
  // Tiada deletion, cuma revoke/expired flag dikira on-the-fly
  saveData(data);
}

function genCode(existing) {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
  } while (existing.some(c => c.code === code && !c.revoked && Date.now() < new Date(c.expiresAt).getTime()));
  return code;
}

function codeStatus(entry) {
  const now = Date.now();
  const exp = new Date(entry.expiresAt).getTime();
  if (entry.revoked) return 'revoked';
  if (now >= exp) return 'expired';
  return 'active';
}

function remainingSeconds(entry) {
  const now = Date.now();
  const exp = new Date(entry.expiresAt).getTime();
  const diff = Math.max(0, Math.floor((exp - now) / 1000));
  return diff;
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/admin.html');
});

// Senarai kod
app.get('/api/codes', (req, res) => {
  cleanupExpired();
  const data = loadData();
  const list = data.codes
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(c => ({
      code: c.code,
      note: c.note || '',
      createdAt: c.createdAt,
      expiresAt: c.expiresAt,
      status: codeStatus(c),
      remainingSec: remainingSeconds(c)
    }));
  res.json({ codes: list });
});

// Jana kod baharu
// body: { duration: number, unit: 'minutes'|'hours', note: string }
app.post('/api/codes', (req, res) => {
  const { duration, unit, note } = req.body || {};
  const durNum = Number(duration);
  if (!durNum || durNum <= 0) {
    return res.status(400).json({ error: 'Duration mesti nombor > 0' });
  }
  if (!['minutes', 'hours'].includes(unit)) {
    return res.status(400).json({ error: 'Unit mesti minutes/hours' });
  }

  const data = loadData();
  const ms = unit === 'minutes' ? durNum * 60 * 1000 : durNum * 60 * 60 * 1000;
  const now = Date.now();
  const expiresAt = new Date(now + ms).toISOString();
  const code = genCode(data.codes);

  const record = {
    code,
    note: (note || '').toString(),
    createdAt: new Date().toISOString(),
    expiresAt,
    revoked: false
  };

  data.codes.push(record);
  saveData(data);

  const link = `/scanner.html`;
  res.json({
    ok: true,
    code,
    expiresAt,
    link // pengguna tetap masukkan kod di halaman scanner
  });
});

// Tamatkan / sekat kod
app.delete('/api/codes/:code', (req, res) => {
  const { code } = req.params;
  const data = loadData();
  const idx = data.codes.findIndex(c => c.code === code);
  if (idx === -1) return res.status(404).json({ error: 'Code tidak dijumpai' });

  data.codes[idx].revoked = true;
  saveData(data);
  res.json({ ok: true });
});

// Validasi kod (scanner gunakan ini)
// query: ?code=xxxxxx
app.get('/api/validate', (req, res) => {
  const code = (req.query.code || '').trim();
  if (!code) return res.status(400).json({ ok: false, reason: 'Tiada kod' });

  const data = loadData();
  const entry = data.codes.find(c => c.code === code);
  if (!entry) return res.json({ ok: false, reason: 'Kod tidak wujud' });

  const status = codeStatus(entry);
  if (status !== 'active') {
    return res.json({ ok: false, reason: status, expiresAt: entry.expiresAt, note: entry.note || '', now: new Date().toISOString() });
  }

  res.json({
    ok: true,
    code: entry.code,
    note: entry.note || '',
    expiresAt: entry.expiresAt,
    now: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`REALSCAN running on http://127.0.0.1:${PORT}`);
  console.log(`Admin panel: http://127.0.0.1:${PORT}/admin.html`);
});
