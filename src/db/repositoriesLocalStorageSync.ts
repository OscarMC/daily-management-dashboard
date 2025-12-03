// src/db/dbLocalStorageSync.ts
import { db } from './dexieRepositories'

const JSON_SERVER_URL = 'http://localhost:3001/repositories'
const STATIC_DB_URL = '../public/data/repositories.json'
const LOCAL_STORAGE_KEY = 'REPOSITORIES_BACKUP'

interface DbDump {
  repositories?: any[]
}

/**
 * Exporta la base de datos completa a JSON
 * y la guarda en:
 *  - localStorage (REPOSITORIES_BACKUP)
 *  - DbJsonServer (POST /repositories) para persistir en repositories.json
 */
async function exportRepositoriesToJSON() {
  try {
    const allRepositories = await db.repositories.toArray()

    const payload: DbDump = {
      repositories: JSON.parse(JSON.stringify(allRepositories))
    }

    const jsonData = JSON.stringify(payload, null, 2)

    // 1) Copia local (localStorage)
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonData)

    // 2) Intentar sincronizar con RepositoriesJsonServer -> repositories.json
    try {
      const resp = await fetch(JSON_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
      })

      if (!resp.ok) {
        console.warn(
          '⚠️ RepositoriesJsonServer respondió con error al guardar repositories.json:',
          resp.status,
          resp.statusText
        )
      } else {
        console.log(
          `✅ Repositorios sincronizados con RepositoriesJsonServer (repositorios: ${
            payload.repositories?.length ?? 0
          })`
        )

       //console.log('✅ Repositorios exportados a JSON')
       //console.log('📦 Tamaño del JSON:', new Blob([jsonData]).size, 'bytes')
       //console.log('📝 Repositorios exportados:', payload.repositories?.length ?? 0)
       //console.log('🌐 Intentando sincronizar con RepositoriesJsonServer...')
       //console.log('🔗 URL:', JSON_SERVER_URL)
      }
    } catch (err) {
      console.warn('⚠️ No se pudo sincronizar con RepositoriesJsonServer (POST /repositories):', err)
    }
  } catch (err) {
    console.error('❌ Error exporting Repositories:', err)
  }
}

/**
 * Importa datos desde (en este orden):
 * 1) RepositoriesJsonServer (http://localhost:3002/repositories)
 * 2) localStorage (REPOSITORIES_BACKUP)
 * 3) fichero estático ../public/data/repositories.json
 */
export async function importFromRepositoriesJSON() {
  try {
    let raw: string | null = null
    let source = 'none'

    // 1) RepositoriesJsonServer
    try {
      const resp = await fetch(JSON_SERVER_URL)
      if (resp.ok) {
        raw = await resp.text()
        source = 'RepositoriesJsonServer'
        console.log('✅ Datos cargados desde RepositoriesJsonServer')
      } else {
        console.warn(
          '⚠️ RepositoriesJsonServer devolvió error en GET /repositories:',
          resp.status,
          resp.statusText
        )
      }
    } catch (err) {
      console.warn('⚠️ No se pudo leer desde RepositoriesJsonServer, probando fuentes locales...', err)
    }

    // 2) localStorage
    if (!raw) {
      raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        source = 'localStorage'
        console.log('✅ Datos cargados desde localStorage')
      }
    }

    // 3) fichero estático .../public/data/repositories.json (primera carga)
    if (!raw) {
      try {
        const resp = await fetch(STATIC_DB_URL)
        if (resp.ok) {
          raw = await resp.text()
          source = 'staticFile'
          console.log('✅ Datos cargados desde fichero estático ../public/data/repositories.json')
        } else {
          console.warn(
            '⚠️ No se pudo leer repositories.json estático:',
            resp.status,
            resp.statusText
          )
        }
      } catch (err) {
        console.warn('⚠️ Error al leer repositories.json estático:', err)
      }
    }

    if (!raw) {
      console.log('ℹ️ No hay datos previos que importar')
      return
    }

    const parsed: DbDump = JSON.parse(raw)
    const repositories = Array.isArray(parsed.repositories) ? parsed.repositories : []

    if (repositories.length) await db.repositories.bulkPut(repositories as any[])
    // Si venía del server o del fichero, lo guardamos también en localStorage
    if (source === 'RepositoriesJsonServer' || source === 'staticFile') {
      localStorage.setItem(LOCAL_STORAGE_KEY, raw)
    }

    console.log(
      `✅ Importación completada desde ${source}: ${repositories.length} repositorios`
    )
  } catch (err) {
    console.error('❌ Error importing DB from JSON:', err)
  }
}

/**
 * Sincronización manual
 */
export async function syncRepositories() {
  await exportRepositoriesToJSON()
}

/**
 * Configura sincronización automática (cada X ms)
 */
export function setupAutoSyncRepositories(intervalMs = 3000) {
  // Exportar inmediatamente al iniciar
  syncRepositories().catch((err) => console.error('Initial AutoSync error:', err))

  // Programar sincronizaciones periódicas
  setInterval(() => {
    syncRepositories().catch((err) => console.error('AutoSync error:', err))
  }, intervalMs)

  // Extra: intentar exportar justo antes de cerrar/recargar pestaña
  window.addEventListener('beforeunload', () => {
    // disparo "rápido" sin esperar resultado
    void exportRepositoriesToJSON()
  })
}

// Hooks automáticos para mantener sincronización en cada cambio Dexie
;(async () => {
  const safeExport = () => {
    queueMicrotask(() => {
      exportRepositoriesToJSON().catch((err) =>
        console.error('Dexie microtask export error:', err)
      )
    })
  }

  db.repositories.hook('creating', safeExport)
  db.repositories.hook('updating', safeExport)
  db.repositories.hook('deleting', safeExport)
})()
