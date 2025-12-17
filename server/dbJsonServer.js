// server.ts
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Rutas a los archivos JSON
const dbPath = path.join(__dirname, '../public/data/DB.json');
const repositoriesPath = path.join(__dirname, '../src/data/repositories.json');
const branchesPath = path.join(__dirname, '../src/data/branches.json');
const holidaysPath = path.join(__dirname, '../src/data/festivos.json');
const pullRequestsPath = path.join(__dirname, '../public/data/pullrequests.json'); // ✨ nuevo

// ========================
// UTILS
// ========================
function log(msg, data) {
  console.log(`[LOG] ${new Date().toISOString()} - ${msg}`, data ? data : '');
}

function errorLog(msg, err) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
  if (err) console.error(err.stack || err);
}

// ========================
// DB.json — Shared utility for user/tasks
// ========================
async function loadDB() {
  log('Loading DB.json');
  const exists = await fs.pathExists(dbPath);
  if (!exists) {
    log('DB.json not found, creating default');
    await fs.outputJson(dbPath, { tasks: [], user: [] }, { spaces: 2 });
  }
  return await fs.readJson(dbPath);
}

async function saveDB(db) {
  log('Saving DB.json');
  await fs.outputJson(dbPath, db, { spaces: 2 });
}

// Full DB endpoints (already existed)
app.get('/db', async (req, res) => {
  try {
    const db = await loadDB();
    res.json(db);
  } catch (err) {
    errorLog('Error in GET /db', err);
    res.status(500).json({ error: 'Failed to load DB.json' });
  }
});

app.post('/db', async (req, res) => {
  try {
    log('POST /db - saving full DB', req.body);
    await saveDB(req.body);
    res.json({ ok: true });
  } catch (err) {
    errorLog('Error in POST /db', err);
    res.status(500).json({ error: 'Failed to save DB.json' });
  }
});

// ========================
// PULL REQUESTS — ✨ NUEVO SISTEMA
// ========================
async function loadPullRequests() {
  log('Loading pullrequests.json');
  const exists = await fs.pathExists(pullRequestsPath);
  if (!exists) {
    log('pullrequests.json not found, creating empty array');
    await fs.outputJson(pullRequestsPath, [], { spaces: 2 });
  }
  log('pullrequests.json loaded', pullRequestsPath);
  return await fs.readJson(pullRequestsPath);
}

async function savePullRequests(prs) {
  log('Saving pullrequests.json', { count: prs.length });
  await fs.outputJson(pullRequestsPath, prs, { spaces: 2 });
}

// GET /pull-requests
app.get('/pull-requests', async (req, res) => {
  try {
    const prs = await loadPullRequests();
    // ⚠️ Sin autenticación real → devolvemos todo (como haces con /tasks)
    // Si en el futuro añades auth, filtra por userId aquí.
    res.json(prs);
  } catch (err) {
    errorLog('Error in GET /pull-requests', err);
    res.status(500).json({ error: 'Failed to load pull requests' });
  }
});

// POST /pull-requests
app.post('/pull-requests', async (req, res) => {
  try {
    log('POST /pull-requests - body:', req.body);
    const { taskId, title, repositoryId, sourceBranch, targetBranch, status = 'pending', externalUrl, notes } = req.body;

    if (!taskId || !title || !repositoryId || !sourceBranch) {
      return res.status(400).json({ error: 'Missing required fields: taskId, title, repositoryId, sourceBranch' });
    }

    const prs = await loadPullRequests();
    const nextId = prs.length > 0 ? Math.max(...prs.map(p => p.id)) + 1 : 1;
    const newPr = {
      id: nextId,
      taskId,
      title: title.trim(),
      repositoryId: repositoryId.toString().trim(),
      sourceBranch: sourceBranch.trim(),
      targetBranch: (targetBranch || 'master').trim(),
      status,
      externalUrl: externalUrl?.trim() || undefined,
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    prs.push(newPr);
    await savePullRequests(prs);
    res.status(201).json(newPr);
  } catch (err) {
    errorLog('Error in POST /pull-requests', err);
    res.status(500).json({ error: 'Failed to create pull request' });
  }
});

// PUT /pull-requests/:id
app.put('/pull-requests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`PUT /pull-requests/${id} - body:`, req.body);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid PR ID' });
    }

    const { status, externalUrl, notes, targetBranch } = req.body;
    const prs = await loadPullRequests();
    const index = prs.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Pull request not found' });
    }

    prs[index] = {
      ...prs[index],
      ...(status !== undefined ? { status } : {}),
      ...(externalUrl !== undefined ? { externalUrl: externalUrl.trim() } : {}),
      ...(notes !== undefined ? { notes: notes.trim() } : {}),
      ...(targetBranch !== undefined ? { targetBranch: targetBranch.trim() } : {}),
      updatedAt: new Date().toISOString()
    };

    await savePullRequests(prs);
    res.json(prs[index]);
  } catch (err) {
    errorLog(`Error in PUT /pull-requests/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to update pull request' });
  }
});

// ========================
// USERS (Auth support)
// ========================
app.get('/user', async (req, res) => {
  try {
    const db = await loadDB();
    res.json(db.user || []);
  } catch (err) {
    errorLog('Error in GET /user', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.post('/user', async (req, res) => {
  try {
    log('POST /user - body:', req.body);
    const { name, email, password, role = 'User', theme = 'light', language = 'es' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const db = await loadDB();
    const users = db.user || [];

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      theme,
      language
    };

    db.user = [...users, newUser];
    await saveDB(db);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    errorLog('Error in POST /user', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ========================
// REPOSITORIES
// ========================
async function loadRepositories() {
  log('Loading repositories.json');
  const exists = await fs.pathExists(repositoriesPath);
  if (!exists) {
    log('repositories.json not found, creating empty array');
    await fs.outputJson(repositoriesPath, { repositories: [] }, { spaces: 2 });
  }
  const data = await fs.readJson(repositoriesPath);
  return data.repositories || [];
}

async function saveRepositories(repos) {
  log('Saving repositories.json', { count: repos.length });
  await fs.outputJson(repositoriesPath, { repositories: repos }, { spaces: 2 });
}

app.get('/repositories', async (req, res) => {
  try {
    const repos = await loadRepositories();
    res.json(repos);
  } catch (err) {
    errorLog('Error in GET /repositories', err);
    res.status(500).json({ error: 'Failed to load repositories' });
  }
});

app.post('/repositories', async (req, res) => {
  try {
    log('POST /repositories - body:', req.body);
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }

    const repos = await loadRepositories();
    const nextId = repos.length > 0 ? Math.max(...repos.map(r => r.id)) + 1 : 1;
    const newRepo = { id: nextId, name: name.trim() };
    repos.push(newRepo);
    await saveRepositories(repos);
    res.status(201).json(newRepo);
  } catch (err) {
    errorLog('Error in POST /repositories', err);
    res.status(500).json({ error: 'Failed to create repository' });
  }
});

app.put('/repositories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`PUT /repositories/${id} - body:`, req.body);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }

    const repos = await loadRepositories();
    const index = repos.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Repository not found' });

    repos[index] = { ...repos[index], name: name.trim() };
    await saveRepositories(repos);
    res.json(repos[index]);
  } catch (err) {
    errorLog(`Error in PUT /repositories/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to update repository' });
  }
});

app.delete('/repositories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`DELETE /repositories/${id}`);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const repos = await loadRepositories();
    const index = repos.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Repository not found' });

    const deleted = repos.splice(index, 1)[0];
    await saveRepositories(repos);
    res.json(deleted);
  } catch (err) {
    errorLog(`Error in DELETE /repositories/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to delete repository' });
  }
});

// ========================
// BRANCHES
// ========================
async function loadBranches() {
  log('Loading branches.json');
  const exists = await fs.pathExists(branchesPath);
  if (!exists) {
    log('branches.json not found, creating empty array');
    await fs.outputJson(branchesPath, { branches: [] }, { spaces: 2 });
  }
  const data = await fs.readJson(branchesPath);
  return data.branches || [];
}

async function saveBranches(branches) {
  log('Saving branches.json', { count: branches.length });
  await fs.outputJson(branchesPath, { branches }, { spaces: 2 });
}

app.get('/branches', async (req, res) => {
  try {
    const branches = await loadBranches();
    res.json(branches);
  } catch (err) {
    errorLog('Error in GET /branches', err);
    res.status(500).json({ error: 'Failed to load branches' });
  }
});

app.post('/branches', async (req, res) => {
  try {
    log('POST /branches - body:', req.body);
    const { name, base = '', description = '', repositoryId } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    const branches = await loadBranches();
    const nextId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
    const newBranch = {
      id: nextId,
      name: name.trim(),
      base: base.trim(),
      description: description.trim(),
      repositoryId: repositoryId ? Number(repositoryId) : undefined
    };
    branches.push(newBranch);
    await saveBranches(branches);
    res.status(201).json(newBranch);
  } catch (err) {
    errorLog('Error in POST /branches', err);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

app.put('/branches/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`PUT /branches/${id} - body:`, req.body);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid branch ID' });

    const { name, base, description, repositoryId } = req.body;
    const branches = await loadBranches();
    const index = branches.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Branch not found' });

    const updated = {
      ...branches[index],
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(base !== undefined ? { base: base.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(repositoryId !== undefined ? { repositoryId: repositoryId ? Number(repositoryId) : undefined } : {})
    };

    branches[index] = updated;
    await saveBranches(branches);
    res.json(updated);
  } catch (err) {
    errorLog(`Error in PUT /branches/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to update branch' });
  }
});

app.delete('/branches/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`DELETE /branches/${id}`);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid branch ID' });

    const branches = await loadBranches();
    const index = branches.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Branch not found' });

    const deleted = branches.splice(index, 1)[0];
    await saveBranches(branches);
    res.json(deleted);
  } catch (err) {
    errorLog(`Error in DELETE /branches/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

// ========================
// HOLIDAYS (FESTIVOS)
// ========================
async function loadHolidays() {
  log('Loading festivos.json');
  const exists = await fs.pathExists(holidaysPath);
  if (!exists) {
    log('festivos.json not found, creating default holidays');
    const defaultHolidays = [
      { date: "01-01", nombre: "Año Nuevo", tipo: "nacional", recurrente: true },
      { date: "01-06", nombre: "Reyes Magos", tipo: "nacional", recurrente: true },
      { date: "05-01", nombre: "Día del Trabajador", tipo: "nacional", recurrente: true },
      { date: "08-15", nombre: "Asunción", tipo: "nacional", recurrente: true },
      { date: "10-12", nombre: "Fiesta Nacional", tipo: "nacional", recurrente: true },
      { date: "11-01", nombre: "Todos los Santos", tipo: "nacional", recurrente: true },
      { date: "12-06", nombre: "Constitución", tipo: "nacional", recurrente: true },
      { date: "12-08", nombre: "Inmaculada", tipo: "nacional", recurrente: true },
      { date: "12-25", nombre: "Navidad", tipo: "nacional", recurrente: true }
    ];
    await fs.outputJson(holidaysPath, defaultHolidays, { spaces: 2 });
    return defaultHolidays;
  }
  const data = await fs.readJson(holidaysPath);
  return data.map((h, i) => ({ ...h, id: h.id ?? i + 1 }));
}

async function saveHolidays(holidays) {
  log('Saving festivos.json', { count: holidays.length });
  await fs.outputJson(holidaysPath, holidays, { spaces: 2 });
}

app.get('/holidays', async (req, res) => {
  try {
    const holidays = await loadHolidays();
    res.json(holidays);
  } catch (err) {
    errorLog('Error in GET /holidays', err);
    res.status(500).json({ error: 'Failed to load holidays' });
  }
});

app.post('/holidays', async (req, res) => {
  try {
    log('POST /holidays - body:', req.body);
    const { date, nombre, tipo, recurrente } = req.body;

    if (!date || !nombre || !tipo) {
      return res.status(400).json({ error: 'date, nombre and tipo are required' });
    }

    const holidays = await loadHolidays();
    const nextId = holidays.length > 0 ? Math.max(...holidays.map(h => h.id)) + 1 : 1;

    let normalizedDate = date.trim();
    if (recurrente && /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      normalizedDate = normalizedDate.substring(5); // YYYY-MM-DD → MM-DD
    } else if (!recurrente && /^\d{2}-\d{2}$/.test(normalizedDate)) {
      const year = new Date().getFullYear();
      normalizedDate = `${year}-${normalizedDate}`;
    }

    const newHoliday = {
      id: nextId,
      date: normalizedDate,
      nombre: nombre.trim(),
      tipo: tipo.trim(),
      recurrente: !!recurrente
    };

    holidays.push(newHoliday);
    await saveHolidays(holidays);
    res.status(201).json(newHoliday);
  } catch (err) {
    errorLog('Error in POST /holidays', err);
    res.status(500).json({ error: 'Failed to create holiday' });
  }
});

app.put('/holidays/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`PUT /holidays/${id} - received body:`, req.body);
    if (isNaN(id)) {
      log(`Invalid ID in PUT /holidays/${req.params.id}`);
      return res.status(400).json({ error: 'Invalid holiday ID' });
    }

    const { date, nombre, tipo, recurrente } = req.body;
    const holidays = await loadHolidays();
    const index = holidays.findIndex(h => h.id === id);
    if (index === -1) {
      log(`Holiday with id=${id} not found`);
      return res.status(404).json({ error: 'Holiday not found' });
    }

    let normalizedDate = date?.trim() ?? holidays[index].date;
    const finalRecurrente = recurrente !== undefined ? !!recurrente : holidays[index].recurrente;

    if (finalRecurrente && /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      normalizedDate = normalizedDate.substring(5);
    } else if (!finalRecurrente && /^\d{2}-\d{2}$/.test(normalizedDate)) {
      const year = new Date().getFullYear();
      normalizedDate = `${year}-${normalizedDate}`;
    }

    holidays[index] = {
      ...holidays[index],
      date: normalizedDate,
      nombre: nombre?.trim() ?? holidays[index].nombre,
      tipo: tipo?.trim() ?? holidays[index].tipo,
      recurrente: finalRecurrente
    };

    log(`Updated holiday:`, holidays[index]);
    await saveHolidays(holidays);
    res.json(holidays[index]);
  } catch (err) {
    errorLog(`Error in PUT /holidays/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to update holiday' });
  }
});

app.delete('/holidays/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    log(`DELETE /holidays/${id}`);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid holiday ID' });

    const holidays = await loadHolidays();
    const index = holidays.findIndex(h => h.id === id);
    if (index === -1) return res.status(404).json({ error: 'Holiday not found' });

    const deleted = holidays.splice(index, 1)[0];
    await saveHolidays(holidays);
    res.json(deleted);
  } catch (err) {
    errorLog(`Error in DELETE /holidays/${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
  log(`✅ Server started on http://localhost:${PORT}`);
});