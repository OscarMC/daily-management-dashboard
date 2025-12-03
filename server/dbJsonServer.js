// server/DbJsonServer.js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Permitir peticiones desde tu cliente Vite
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Ruta al fichero DB.json
const dbPath = path.join(__dirname, '../public/data/DB.json');
const repositoriesPath = path.join(__dirname, '../public/data/repositories.json');

// -----------------------------
// Helpers
// -----------------------------
async function loadDB() {
  const exists = await fs.pathExists(dbPath);
  if (!exists) {
    await fs.outputJson(dbPath, { tasks: [], user: [] }, { spaces: 2 });
  }
  return await fs.readJson(dbPath);
}

async function saveDB(db) {
  await fs.outputJson(dbPath, db, { spaces: 2 });
}

// -----------------------------
// GET /db → devuelve toda la BD
// -----------------------------
app.get('/db', async (req, res) => {
  try {
    const db = await loadDB();
    res.json(db);
  } catch (err) {
    console.error('❌ Error leyendo DB.json:', err);
    res.status(500).json({ error: 'Error loading DB.json' });
  }
});

// -----------------------------
// POST /db → sobrescribe la BD
// -----------------------------
app.post('/db', async (req, res) => {
  try {
    await saveDB(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Error guardando DB.json:', err);
    res.status(500).json({ error: 'Error saving DB.json' });
  }
});

// -----------------------------
// REPOSITORIES ENDPOINTS (CRUD)
// -----------------------------

// Helper para cargar repositorios
async function loadRepositories() {
  const exists = await fs.pathExists(repositoriesPath);
  if (!exists) {
    await fs.outputJson(repositoriesPath, { repositories: [] }, { spaces: 2 });
  }
  const data = await fs.readJson(repositoriesPath);
  return data.repositories || [];
}

// Helper para guardar repositorios
async function saveRepositories(repositories) {
  await fs.outputJson(repositoriesPath, { repositories }, { spaces: 2 });
}

// GET /repositories → devuelve todos los repositorios
app.get('/repositories', async (req, res) => {
  try {
    const repos = await loadRepositories();
    res.json(repos);
  } catch (err) {
    console.error('❌ Error leyendo repositories.json:', err);
    res.status(500).json({ error: 'Error loading repositories' });
  }
});

// POST /repositories → crea un nuevo repositorio
app.post('/repositories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }

    const repos = await loadRepositories();
    const nextId = repos.length > 0 ? Math.max(...repos.map(r => r.id)) + 1 : 1;
    const newRepo = { id: nextId, name };

    repos.push(newRepo);
    await saveRepositories(repos);

    res.status(201).json(newRepo);
  } catch (err) {
    console.error('❌ Error creando repositorio:', err);
    res.status(500).json({ error: 'Error creating repository' });
  }
});

// PUT /repositories/:id → actualiza un repositorio
app.put('/repositories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }

    const repos = await loadRepositories();
    const index = repos.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const oldName = repos[index].name;
    repos[index] = { ...repos[index], name };
    await saveRepositories(repos);

    res.json({ ...repos[index], oldName });
  } catch (err) {
    console.error('❌ Error actualizando repositorio:', err);
    res.status(500).json({ error: 'Error updating repository' });
  }
});

// DELETE /repositories/:id → elimina un repositorio
app.delete('/repositories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const repos = await loadRepositories();
    const index = repos.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const deleted = repos.splice(index, 1)[0];
    await saveRepositories(repos);

    res.json(deleted);
  } catch (err) {
    console.error('❌ Error eliminando repositorio:', err);
    res.status(500).json({ error: 'Error deleting repository' });
  }
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`📌 DB JSON server running on http://localhost:${PORT}`);
});