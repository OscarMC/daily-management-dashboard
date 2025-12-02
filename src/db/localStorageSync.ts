import { db } from './dexieDB'

/**
 * Exporta la base de datos completa a JSON.
 */
async function exportToJSON() {
 try {
  const allTasks = await db.tasks.toArray()
  const allUsers = await db.user.toArray()

  const payload = {
   tasks: JSON.parse(JSON.stringify(allTasks)),
   user: JSON.parse(JSON.stringify(allUsers))
  }

  const jsonData = JSON.stringify(payload, null, 2)
  localStorage.setItem('DB_BACKUP', jsonData)
 } catch (err) {
  console.error('❌ Error exporting DB:', err)
 }
}

/**
 * Importa datos desde el JSON almacenado en localStorage (o desde fichero futuro)
 */
export async function importFromJSON() {
 try {
  const raw = localStorage.getItem('DB_BACKUP')
  if (!raw) return

  const { tasks, user } = JSON.parse(raw)

  if (Array.isArray(tasks)) await db.tasks.bulkPut(tasks)
  if (Array.isArray(user)) await db.user.bulkPut(user)

  console.info('✅ Database imported from localStorage backup.')
 } catch (err) {
  console.error('❌ Error importing DB from JSON:', err)
 }
}

/**
 * Sincroniza la base de datos exportando sus contenidos.
 */
export async function sync() {
 await exportToJSON()
}

/**
 * Configura sincronización automática (cada X ms)
 */
export function setupAutoSync(intervalMs = 3000) {
 // Exportar inmediatamente al iniciar
 sync()

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
