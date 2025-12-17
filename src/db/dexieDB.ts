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
 userId: number // 👈 obligatorio
}

export interface UserProfile {
 id: number
 name: string
 role: string
 email: string
 theme?: string
 language?: string
 notificationsEnabled?: boolean
 createdAt?: string
 updatedAt?: string
}

export interface PullRequest {
 id?: string; // Dexie lo genera si usas auto-increment o uuid
 taskId: string;
 title: string;
 repositoryId: string;
 sourceBranch: string;
 targetBranch: string;
 status: 'pending' | 'in-review' | 'approved' | 'merged' | 'blocked';
 externalUrl?: string;
 notes?: string;
 createdAt: Date;
 updatedAt: Date;
 userId: string; // siempre el userId autenticado
}

// === Base de datos Dexie ===
export class AppDatabase extends Dexie {
 tasks!: Table<Task, number>;
 user!: Table<UserProfile, number>;
 pullRequests!: Dexie.Table<PullRequest, string>; // ← nueva tabla

 constructor() {
  super('dailyManagementDB')
  // 👇 Incrementamos la versión y añadimos userId al índice
  this.version(6).stores({
   tasks: '++id, userId, name, date, completed, type',
   user: '++id, email', // ✅ Ahora `email` está indexado
   pullRequests: 'id, userId, taskId, status, createdAt', // índices útiles
  })
 }
}

export const db = new AppDatabase()
