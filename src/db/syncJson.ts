import { db } from './dexieDB'

/**
 * Exporta la base de datos a JSON sin dejar referencias o promesas no serializables
 */
async function exportToJSON() {
 try {
  const allTasks = await db.tasks.toArray()
  const allUsers = await db.user.toArray()

  // Forzar serialización limpia
  const payload = {
   tasks: JSON.parse(JSON.stringify(allTasks)),
   user: JSON.parse(JSON.stringify(allUsers))
  }

  const jsonData = JSON.stringify(payload, null, 2)
  localStorage.setItem('DB_BACKUP', jsonData)
 } catch (err) {
  console.error('Error exporting DB to JSON:', err)
 }
}

/**
 * Fuerza sincronización manual (si se requiere)
 */
export async function sync() {
 await exportToJSON()
}

// Hooks Dexie seguros
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
