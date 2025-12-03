// src/db/dexieDB.ts
import Dexie, { Table } from 'dexie'

// === Tipos base ===
export interface Repository {
 id?: number
 name: string
}

// === Base de datos Dexie ===
export class AppRepository extends Dexie {
 repositories!: Table<Repository, number>

 constructor() {
  super('dailyManagementrepository')
  this.version(3).stores({
   repositories: '++id, name'
  })
 }
}

export const db = new AppRepository()
