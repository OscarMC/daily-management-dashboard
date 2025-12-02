import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = 3001

const dbPath = path.join(__dirname, '../public/data/DB.json')

app.use(bodyParser.json({ limit: '10mb' }))
app.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*')
 res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
 res.header('Access-Control-Allow-Headers', 'Content-Type')
 next()
})

app.get('/db', async (_, res) => {
 try {
  const exists = await fs.pathExists(dbPath)
  if (!exists) await fs.outputJson(dbPath, { tasks: [], user: [] })
  const data = await fs.readJson(dbPath)
  res.json(data)
 } catch (err) {
  console.error(err)
  res.status(500).json({ error: 'Error reading DB.json' })
 }
})

app.post('/db', async (req, res) => {
 try {
  await fs.outputJson(dbPath, req.body, { spaces: 2 })
  res.json({ ok: true })
 } catch (err) {
  console.error(err)
  res.status(500).json({ error: 'Error writing DB.json' })
 }
})

app.listen(PORT, () => console.log(`🗂️ JSON server running on http://localhost:${PORT}`))
