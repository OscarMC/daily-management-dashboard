// src/db/dbLocalStorageSync.ts
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
 *  - DbJsonServer (POST /db) para persistir en DB.json
 */
async function exportToJSON() {
  try {
    const allTasks = await db.tasks.toArray()
    const allUsers = await db.user.toArray()

    const payload: DbDump = {
      tasks: JSON.parse(JSON.stringify(allTasks)),
      user: JSON.parse(JSON.stringify(allUsers))
    }

    const jsonData = JSON.stringify(payload, null, 2)

    // 1) Copia local (localStorage)
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonData)

    // 2) Intentar sincronizar con DbJsonServer -> DB.json
    try {
      const resp = await fetch(JSON_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
      })

      if (!resp.ok) {
        console.warn(
          '⚠️ DbJsonServer respondió con error al guardar DB.json:',
          resp.status,
          resp.statusText
        )
      } else {
        //console.log(
        //  `✅ DB sincronizada con DbJsonServer (tareas: ${
        //    payload.tasks?.length ?? 0
        //  }, usuarios: ${payload.user?.length ?? 0})`
        //)

       //console.log('✅ DB exportada a JSON')
       //console.log('📦 Tamaño del JSON:', new Blob([jsonData]).size, 'bytes')
       //console.log('📝 Tareas exportadas:', payload.tasks?.length ?? 0)
       //console.log('📝 Usuarios exportados:', payload.user?.length ?? 0)
       //console.log('🌐 Intentando sincronizar con DbJsonServer...')
       //console.log('🔗 URL:', JSON_SERVER_URL)
      }
    } catch (err) {
      console.warn('⚠️ No se pudo sincronizar con DbJsonServer (POST /db):', err)
    }
  } catch (err) {
    console.error('❌ Error exporting DB:', err)
  }
}

/**
 * Importa datos desde (en este orden):
 * 1) DbJsonServer (http://localhost:3001/db)
 * 2) localStorage (DB_BACKUP)
 * 3) fichero estático /data/DB.json
 */
export async function importFromJSON() {
  try {
    let raw: string | null = null
    let source = 'none'

    // 1) DbJsonServer
    try {
      const resp = await fetch(JSON_SERVER_URL)
      if (resp.ok) {
        raw = await resp.text()
        source = 'DbJsonServer'
        //('✅ Datos cargados desde DbJsonServer')
      } else {
        console.warn(
          '⚠️ DbJsonServer devolvió error en GET /db:',
          resp.status,
          resp.statusText
        )
      }
    } catch (err) {
      console.warn('⚠️ No se pudo leer desde DbJsonServer, probando fuentes locales...', err)
    }

    // 2) localStorage
    if (!raw) {
      raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        source = 'localStorage'
        //console.log('✅ Datos cargados desde localStorage')
      }
    }

    // 3) fichero estático /data/DB.json (primera carga)
    if (!raw) {
      try {
        const resp = await fetch(STATIC_DB_URL)
        if (resp.ok) {
          raw = await resp.text()
          source = 'staticFile'
          //console.log('✅ Datos cargados desde fichero estático /data/DB.json')
        } else {
          console.warn(
            '⚠️ No se pudo leer DB.json estático:',
            resp.status,
            resp.statusText
          )
        }
      } catch (err) {
        console.warn('⚠️ Error al leer DB.json estático:', err)
      }
    }

    if (!raw) {
      //console.log('ℹ️ No hay datos previos que importar')
      return
    }

    const parsed: DbDump = JSON.parse(raw)
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : []
    const user = Array.isArray(parsed.user) ? parsed.user : []

    if (tasks.length) await db.tasks.bulkPut(tasks as any[])
    if (user.length) await db.user.bulkPut(user as any[])

    // Si venía del server o del fichero, lo guardamos también en localStorage
    if (source === 'DbJsonServer' || source === 'staticFile') {
      localStorage.setItem(LOCAL_STORAGE_KEY, raw)
    }

    //console.log(
    //  `✅ Importación completada desde ${source}: ${tasks.length} tareas, ${user.length} usuarios`
    //)
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

  // Extra: intentar exportar justo antes de cerrar/recargar pestaña
  window.addEventListener('beforeunload', () => {
    // disparo "rápido" sin esperar resultado
    void exportToJSON()
  })
}

// Hooks automáticos para mantener sincronización en cada cambio Dexie
;(async () => {
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
