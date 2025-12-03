// src/db/branchesStore.ts
import { useState, useEffect } from 'react';
import { getBranches, addBranch, updateBranch, deleteBranch } from './api';

export interface Branch {
 id: number;
 name: string;
 base: string;
 description: string;
 repositoryId?: number;
}

export function useBranches() {
 const [branches, setBranches] = useState<Branch[]>([]);

 useEffect(() => {
  const load = async () => {
   try {
    const data = await getBranches();
    setBranches(data);
   } catch (err) {
    console.error('Error loading branches:', err);
    setBranches([]);
   }
  };
  load();
 }, []);

 const addBranchLocal = async (branch: Omit<Branch, 'id'>) => {
  try {
   const newBranch = await addBranch(branch);
   setBranches((prev) => [...prev, newBranch]);
   return newBranch;
  } catch (err) {
   console.error('Error adding branch:', err);
   throw err;
  }
 };

 const updateBranchLocal = async (id: number, updated: Partial<Branch>) => {
  try {
   const updatedBranch = await updateBranch(id, updated);
   setBranches((prev) =>
    prev.map((b) => (b.id === id ? updatedBranch : b))
   );
  } catch (err) {
   console.error('Error updating branch:', err);
   throw err;
  }
 };

 const deleteBranchLocal = async (id: number) => {
  try {
   await deleteBranch(id);
   setBranches((prev) => prev.filter((b) => b.id !== id));
  } catch (err) {
   console.error('Error deleting branch:', err);
   throw err;
  }
 };

 return {
  branches,
  addBranch: addBranchLocal,
  updateBranch: updateBranchLocal,
  deleteBranch: deleteBranchLocal,
 };
}