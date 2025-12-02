import { db } from '../db/dexieDB'

export async function seedDatabase() {
 await db.user.add({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Developer',
  theme: 'light',
  language: 'en'
 })

 const today = new Date().toISOString().substring(0, 10)

 await db.tasks.bulkAdd([
  {
   name: 'Implement login UI',
   description: 'Create login form with validation',
   branch: 'feature/login-ui',
   estimated: '3h',
   completed: false,
   createdAt: new Date().toISOString(),
   date: today,
   hours: 2.5
  },
  {
   name: 'Refactor Dashboard layout',
   description: 'Improve component structure and spacing',
   branch: 'refactor/dashboard',
   estimated: '2h',
   completed: true,
   createdAt: new Date().toISOString(),
   date: today,
   hours: 3
  }
 ])
}
