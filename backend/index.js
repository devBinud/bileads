require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Firebase REST client ─────────────────────────────────────────────────────
const DB_URL = 'https://leadradar-bc285-default-rtdb.firebaseio.com';
const SECRET = process.env.FIREBASE_DB_SECRET || '';

function firebaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const authParam = SECRET ? `?auth=${SECRET}` : '';
    const fullPath  = `/leads${path}.json${authParam}`;
    const payload   = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'leadradar-bc285-default-rtdb.firebaseio.com',
      path: fullPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const db = {
  push:   (data)     => firebaseRequest('POST',   '',       data),
  getAll: ()         => firebaseRequest('GET',    '',       null),
  update: (id, data) => firebaseRequest('PATCH',  `/${id}`, data),
  remove: (id)       => firebaseRequest('DELETE', `/${id}`, null),
};

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getAllLeads() {
  const data = await db.getAll();
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Get All Leads ────────────────────────────────────────────────────────────
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.json({ leads, total: leads.length });
  } catch (err) {
    console.error('[leads]', err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// ─── Add Lead manually ────────────────────────────────────────────────────────
app.post('/api/leads', async (req, res) => {
  const lead = req.body;
  if (!lead?.name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await db.push({
      ...lead,
      status:    lead.status    || 'new',
      notes:     lead.notes     || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.json({ success: true, id: result.name });
  } catch (err) {
    console.error('[add lead]', err.message);
    res.status(500).json({ error: 'Failed to add lead' });
  }
});

// ─── Update Lead ──────────────────────────────────────────────────────────────
app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const allowed = ['new', 'contacted', 'replied', 'closed'];
  if (status && !allowed.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  try {
    const update = { updatedAt: new Date().toISOString() };
    if (status !== undefined) update.status = status;
    if (notes  !== undefined) update.notes  = notes;
    await db.update(id, update);
    res.json({ success: true });
  } catch (err) {
    console.error('[update lead]', err.message);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// ─── Delete Lead ──────────────────────────────────────────────────────────────
app.delete('/api/leads/:id', async (req, res) => {
  try {
    await db.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[delete lead]', err.message);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const leads = await getAllLeads();
    const today = new Date().toISOString().split('T')[0];
    res.json({
      total:          leads.length,
      hot:            leads.filter(l => l.isHot).length,
      noWebsite:      leads.filter(l => !l.hasWebsite).length,
      contacted:      leads.filter(l => l.status === 'contacted').length,
      contactedToday: leads.filter(l => l.status === 'contacted' && l.updatedAt?.startsWith(today)).length,
      new:            leads.filter(l => l.status === 'new').length,
    });
  } catch (err) {
    console.error('[stats]', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎯 BiLeads Backend running on port ${PORT}`);
});
