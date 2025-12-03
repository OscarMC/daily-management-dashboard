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
 language?: string
 notificationsEnabled?: boolean
 createdAt?: string
 updatedAt?: string
}

// === Base de datos Dexie ===
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
