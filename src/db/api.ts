// src/db/api.ts
const API = "http://localhost:3001/tasks";

export async function getTasks() {
 const res = await fetch(API);
 return await res.json();
}

export async function addTask(task: any) {
 const res = await fetch(API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(task),
 });
 return await res.json();
}

export async function updateTask(task: any) {
 await fetch(`${API}/${task.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(task),
 });
}

export async function deleteTask(id: number) {
 await fetch(`${API}/${id}`, {
  method: "DELETE",
 });
}
