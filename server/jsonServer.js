// server/jsonServer.js (versión CommonJS para usar con `node server/jsonServer.js`)
const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3001

// Ruta al fichero DB.json dentro de public/data
const dbPath = path.join(__dirname, '../public/data/DB.json')

// Middleware
app.use(bodyParser.json({ limit: '10mb' }))
app.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*')
 res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
 res.header('Access-Control-Allow-Headers', 'Content-Type')
 next()
})

// GET /db -> lee DB.json (y lo crea si no existe)
app.get('/db', async (_, res) => {
 try {
  const exists = await fs.pathExists(dbPath)
  if (!exists) {
   // Si no existe el fichero, inicializamos una estructura básica
   await fs.outputJson(dbPath, { tasks: [], user: [] }, { spaces: 2 })
  }

  const data = await fs.readJson(dbPath)
  res.json(data)
 } catch (err) {
  console.error(err)
  res.status(500).json({ error: 'Error reading DB.json' })
 }
})

// POST /db -> sobrescribe DB.json con el cuerpo de la petición
app.post('/db', async (req, res) => {
 try {
  await fs.outputJson(dbPath, req.body, { spaces: 2 })
  res.json({ ok: true })
 } catch (err) {
  console.error(err)
  res.status(500).json({ error: 'Error writing DB.json' })
 }
})

// Arrancar servidor
app.listen(PORT, () => {
 console.log(`🗂️ JSON server running on http://localhost:${PORT}`)
})
