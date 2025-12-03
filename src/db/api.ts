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