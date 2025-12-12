import { Task } from '../db/dexieDB'

// src/db/api.ts
const BASE_URL = "http://localhost:3001";

// 👇 Nueva función auxiliar: obtener userId del contexto
// Pero como api.ts no debe depender de React, lo pasaremos desde los hooks
// Así que refactorizamos las funciones para aceptar userId

// --- Tasks API (filtradas por userId) ---

export async function getTasks(userId: number) {
 const res = await fetch(`${BASE_URL}/tasks?userId=${userId}`);
 if (!res.ok) throw new Error('Failed to fetch tasks');
 return await res.json();
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId: number) {
 const newTask = {
  ...task,
  userId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
 };
 const res = await fetch(`${BASE_URL}/tasks`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newTask),
 });
 if (!res.ok) throw new Error('Failed to add task');
 return await res.json();
}

export async function updateTask(task: Task & { id: number }) {
 const res = await fetch(`${BASE_URL}/tasks/${task.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   ...task,
   updatedAt: new Date().toISOString()
  }),
 });
 if (!res.ok) throw new Error('Failed to update task');
 return await res.json();
}

export async function deleteTask(id: number) {
 const res = await fetch(`${BASE_URL}/tasks/${id}`, {
  method: "DELETE",
 });
 if (!res.ok) throw new Error('Failed to delete task');
}

// --- Repositories API ---

export async function getRepositories() {
 const res = await fetch(`${BASE_URL}/repositories`);
 return await res.json();
}

export async function addRepository(name: string) {
 const res = await fetch(`${BASE_URL}/repositories`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name }),
 });
 return await res.json();
}

export async function updateRepository(id: number, name: string) {
 await fetch(`${BASE_URL}/repositories/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name }),
 });
}

export async function deleteRepository(id: number) {
 await fetch(`${BASE_URL}/repositories/${id}`, {
  method: "DELETE",
 });
}

// --- Branches API ---

export async function getBranches() {
 const res = await fetch(`${BASE_URL}/branches`);
 if (!res.ok) throw new Error('Failed to fetch branches');
 return await res.json();
}

export async function addBranch(data: {
 name: string;
 base?: string;
 description?: string;
 repositoryId?: number;
}) {
 const res = await fetch(`${BASE_URL}/branches`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error('Failed to add branch');
 return await res.json();
}

export async function updateBranch(id: number, data: Partial<{
 name: string;
 base: string;
 description: string;
 repositoryId: number;
}>) {
 const res = await fetch(`${BASE_URL}/branches/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error('Failed to update branch');
 return await res.json();
}

export async function deleteBranch(id: number) {
 const res = await fetch(`${BASE_URL}/branches/${id}`, {
  method: 'DELETE',
 });
 if (!res.ok) throw new Error('Failed to delete branch');
}

// --- Holidays API ---

export async function getHolidays() {
 const res = await fetch(`${BASE_URL}/holidays`);
 if (!res.ok) throw new Error('Failed to fetch holidays');
 return await res.json();
}

export async function addHoliday(data: {
 date: string;
 nombre: string;
 tipo: string;
 recurrente: boolean;
}) {
 const res = await fetch(`${BASE_URL}/holidays`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error('Failed to add holiday');
 return await res.json();
}

export async function updateHoliday(id: number, data: Partial<{
 date: string;
 nombre: string;
 tipo: string;
 recurrente: boolean;
}>) {
 const res = await fetch(`${BASE_URL}/holidays/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error('Failed to update holiday');
 return await res.json();
}

export async function deleteHoliday(id: number) {
 const res = await fetch(`${BASE_URL}/holidays/${id}`, {
  method: 'DELETE',
 });
 if (!res.ok) throw new Error('Failed to delete holiday');
}

// --- Auth / Users API ---

export async function getUsers() {
 const res = await fetch(`${BASE_URL}/user`);
 if (!res.ok) throw new Error('Failed to fetch users');
 return await res.json();
}

export async function createUser(userData: {
 name: string;
 email: string;
 password: string;
 role: string;
 theme: string;
 language: string;
}) {
 const res = await fetch(`${BASE_URL}/user`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData),
 });
 if (!res.ok) throw new Error('Failed to create user');
 return await res.json();
}