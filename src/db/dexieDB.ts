// src/db/dexieDB.ts
import Dexie, { Table } from 'dexie'

// === Tipos base ===
export interface Task {
 id?: number
 name: string
 description: string
 branch?: string
 estimated?: string
 completed: boolean
 createdAt: string
 date: string
 hours: number
 itemId: string
 repositoryId?: number
 mergeIn?: string
 type?: 'WIGOS' | 'TASK' | 'VACACIONES' | 'OTROS'
}

export interface UserProfile {
 id?: number
 name: string
 role: string
 email?: string
 theme?: string
}

// === Configuración principal de la BD ===
export class AppDatabase extends Dexie {
 tasks!: Table<Task, number>
 user!: Table<UserProfile, number>

 constructor() {
  super('dailyManagementDB')
  this.version(3).stores({
   tasks: '++id, name, date, completed, type',
   user: '++id, name'
  })
 }
}

export const db = new AppDatabase()

// === PERSISTENCIA EN JSON ===
const FILE_PATH = '/DB.json'

async function exportToJSON() {
 try {
  const allTasks = await db.tasks.toArray()
  const allUsers = await db.user.toArray()
  const data = JSON.stringify({ tasks: allTasks, user: allUsers }, null, 2)
  localStorage.setItem('DB_BACKUP', data)

  if (typeof window === 'undefined') {
   const fs = await import('fs')
   fs.writeFileSync(FILE_PATH, data)
  }
 } catch (err) {
  console.error('❌ Error exportando DB.json:', err)
 }
}

async function importFromJSON() {
 try {
  let raw: string | null = null

  if (typeof window === 'undefined') {
   const fs = await import('fs')
   if (fs.existsSync(FILE_PATH)) raw = fs.readFileSync(FILE_PATH, 'utf8')
  } else {
   raw = localStorage.getItem('DB_BACKUP')
  }

  if (!raw) return
  const { tasks, user } = JSON.parse(raw)
  if (Array.isArray(tasks)) await db.tasks.bulkPut(tasks)
  if (Array.isArray(user)) await db.user.bulkPut(user)
 } catch (err) {
  console.error('❌ Error importando DB.json:', err)
 }
}

// === Sincronización automática ===
; (async () => {
 await importFromJSON()

 db.tasks.hook('creating', () => queueMicrotask(exportToJSON))
 db.tasks.hook('updating', () => queueMicrotask(exportToJSON))
 db.tasks.hook('deleting', () => queueMicrotask(exportToJSON))
 db.user.hook('updating', () => queueMicrotask(exportToJSON))
})()
