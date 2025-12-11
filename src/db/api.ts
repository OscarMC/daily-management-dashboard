// src/db/api.ts
const BASE_URL = "http://localhost:3001";

export async function getTasks() {
 const res = await fetch(`${BASE_URL}/tasks`);
 return await res.json();
}

export async function addTask(task: any) {
 const res = await fetch(`${BASE_URL}/tasks`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(task),
 });
 return await res.json();
}

export async function updateTask(task: any) {
 await fetch(`${BASE_URL}/tasks/${task.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(task),
 });
}

export async function deleteTask(id: number) {
 await fetch(`${BASE_URL}/tasks/${id}`, {
  method: "DELETE",
 });
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