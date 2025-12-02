// src/db/localStorageSync.ts
import { db } from './dexieDB'

const JSON_SERVER_URL = 'http://localhost:3001/db'
const STATIC_DB_URL = '/data/DB.json'
const LOCAL_STORAGE_KEY = 'DB_BACKUP'

interface DbDump {
 tasks?: any[]
 user?: any[]
}

/**
 * Exporta la base de datos completa a JSON
 * y la guarda en:
 *  - localStorage (DB_BACKUP)
 *  - jsonServer (POST /db) si está levantado
 */
async function exportToJSON() {
 try {
  const allTasks = await db.tasks.toArray()
  const allUsers = await db.user.toArray()

  const payload: DbDump = {
   tasks: JSON.parse(JSON.stringify(allTasks)),
   user: JSON.parse(JSON.stringify(allUsers)),
  }

  const jsonData = JSON.stringify(payload, null, 2)

  // 1) Copia local (localStorage)
  localStorage.setItem(LOCAL_STORAGE_KEY, jsonData)

  // 2) Intentar sincronizar con jsonServer
  try {
   await fetch(JSON_SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonData,
   })
   console.log('✅ DB sincronizada con jsonServer')
  } catch (err) {
   console.warn('⚠️ No se pudo sincronizar con jsonServer (POST):', err)
  }
 } catch (err) {
  console.error('❌ Error exporting DB:', err)
 }
}

/**
 * Importa datos desde (en este orden):
 * 1) jsonServer (http://localhost:3001/db)
 * 2) localStorage (DB_BACKUP)
 * 3) fichero estático /data/DB.json
 */
export async function importFromJSON() {
 try {
  let raw: string | null = null
  let source = 'none'

  // 1) jsonServer
  try {
   const resp = await fetch(JSON_SERVER_URL)
   if (resp.ok) {
    raw = await resp.text()
    source = 'jsonServer'
    console.log('✅ Datos cargados desde jsonServer')
   }
  } catch (err) {
   console.warn('⚠️ No se pudo leer desde jsonServer, probando fuentes locales...')
  }

  // 2) localStorage
  if (!raw) {
   raw = localStorage.getItem(LOCAL_STORAGE_KEY)
   if (raw) {
    source = 'localStorage'
    console.log('✅ Datos cargados desde localStorage')
   }
  }

  // 3) fichero estático /data/DB.json (primera carga)
  if (!raw) {
   try {
    const resp = await fetch(STATIC_DB_URL)
    if (resp.ok) {
     raw = await resp.text()
     source = 'staticFile'
     console.log('✅ Datos cargados desde fichero estático /data/DB.json')
    }
   } catch (err) {
    console.warn('⚠️ No se pudo leer DB.json estático:', err)
   }
  }

  if (!raw) {
   console.log('ℹ️ No hay datos previos que importar')
   return
  }

  const parsed: DbDump = JSON.parse(raw)
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : []
  const user = Array.isArray(parsed.user) ? parsed.user : []

  if (tasks.length) await db.tasks.bulkPut(tasks as any[])
  if (user.length) await db.user.bulkPut(user as any[])

  // Si venía del server o del fichero, lo guardamos también en localStorage
  if (source === 'jsonServer' || source === 'staticFile') {
   localStorage.setItem(LOCAL_STORAGE_KEY, raw)
  }

  console.log(
   `✅ Importación completada desde ${source}: ${tasks.length} tareas, ${user.length} usuarios`
  )
 } catch (err) {
  console.error('❌ Error importing DB from JSON:', err)
 }
}

/**
 * Sincronización manual
 */
export async function sync() {
 await exportToJSON()
}

/**
 * Configura sincronización automática (cada X ms)
 */
export function setupAutoSync(intervalMs = 3000) {
 // Exportar inmediatamente al iniciar
 sync().catch((err) => console.error('Initial AutoSync error:', err))

 // Programar sincronizaciones periódicas
 setInterval(() => {
  sync().catch((err) => console.error('AutoSync error:', err))
 }, intervalMs)
}

// Hooks automáticos para mantener sincronización en cada cambio Dexie
; (async () => {
 const safeExport = () => {
  queueMicrotask(() => {
   exportToJSON().catch((err) =>
    console.error('Dexie microtask export error:', err)
   )
  })
 }

 db.tasks.hook('creating', safeExport)
 db.tasks.hook('updating', safeExport)
 db.tasks.hook('deleting', safeExport)
 db.user.hook('updating', safeExport)
})()
