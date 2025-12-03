// server/DbJsonServer.js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Permitir peticiones desde tu cliente Vite
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Ruta al fichero DB.json
const repositoriesPath = path.join(__dirname, '../public/data/repositories.json');

// -----------------------------
// Helpers
// -----------------------------
async function loadRepositories() {
 const exists = await fs.pathExists(repositoriesPath);
 if (!exists) {
  await fs.outputJson(repositoriesPath, { repositories: [] }, { spaces: 1 });
 }
 return await fs.readJson(repositoriesPath);
}

async function saveRepositories(repositories) {
 await fs.outputJson(repositoriesPath, repositories, { spaces: 1 });
}

// -----------------------------
// GET /repositories → devuelve toda la BD
// -----------------------------
app.get('/repositories', async (req, res) => {
 try {
  const db = await loadRepositories();
  res.json(db);
 } catch (err) {
  console.error('❌ Error leyendo repositories.json:', err);
  res.status(500).json({ error: 'Error loading repositories.json' });
 }
});

// -----------------------------
// POST /repositories → sobrescribe la BD
// -----------------------------
app.post('/repositories', async (req, res) => {
 try {
  await saveRepositories(req.body);
  res.json({ ok: true });
 } catch (err) {
  console.error('❌ Error guardando repositories.json:', err);
  res.status(500).json({ error: 'Error saving repositories.json' });
 }
});

// -----------------------------
app.listen(PORT, () => {
 console.log(`📌 Repositories JSON server running on http://localhost:${PORT}`);
});
