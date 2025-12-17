import { db } from '../db/dexieDB'

export async function seedDatabase() {
 const userId = await db.user.add({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Developer',
  theme: 'light',
  language: 'en',
  notificationsEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
 })

 const today = new Date().toISOString().substring(0, 10)

 await db.tasks.bulkAdd([
  {
   userId: userId as number,
   name: 'Implement login UI',
   description: 'Create login form with validation',
   branch: 'feature/login-ui',
   estimated: '3h',
   completed: false,
   createdAt: new Date().toISOString(),
   date: today,
   hours: 2.5,
   itemId: 'task-001'
  },
  {
   userId: userId as number,
   name: 'Refactor Dashboard layout',
   description: 'Improve component structure and spacing',
   branch: 'refactor/dashboard',
   estimated: '2h',
   completed: true,
   createdAt: new Date().toISOString(),
   date: today,
   hours: 3,
   itemId: 'task-002',
   repositoryId: 1,
   mergeIn: 'main',
   type: 'TASK'
  }
 ])
}
