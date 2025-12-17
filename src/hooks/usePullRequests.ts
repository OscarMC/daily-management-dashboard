// src/hooks/usePullRequests.ts
import { useState, useEffect } from 'react';

export interface PullRequest {
 id: number;
 taskId: string | number; // puede ser string (TASK-00001) o number (id de Dexie)
 title: string;
 repositoryId: string;
 sourceBranch: string;
 targetBranch: string;
 status: 'pending' | 'in-review' | 'approved' | 'merged' | 'blocked';
 externalUrl?: string;
 notes?: string;
 createdAt: string;
 updatedAt: string;
}

const API_BASE = 'http://localhost:3001';

export const usePullRequests = () => {
 const [prs, setPrs] = useState<PullRequest[]>([]);
 const [loading, setLoading] = useState(true);

 const fetchPrs = async () => {
  setLoading(true);
  try {
   const res = await fetch(`${API_BASE}/pull-requests`);
   if (res.ok) {
    const data: PullRequest[] = await res.json();
    setPrs(data);
   } else {
    console.log('Failed to fetch PRs:', await res.text());
   }
  } catch (err) {
   console.log('Network error fetching PRs:', err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchPrs();
 }, []);

 const createPr = async (pr: Omit<PullRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  console.log('Creating PR with data:', pr);
  const res = await fetch(`${API_BASE}/pull-requests`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(pr),
  });
  console.log('Response from creating PR:', res);
  if (res.ok) {
   fetchPrs(); // recargar lista
  } else {
   const error = await res.text();
   console.log('Error creating PR:', error);
   throw new Error(`Failed to create PR: ${error}`);
  }
 };

 const updatePrStatus = async (id: number, status: PullRequest['status']) => {
  console.log(`Updating PR ${id} to status: ${status}`);
  const res = await fetch(`${API_BASE}/pull-requests/${id}`, {
   method: 'PUT',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ status }),
  });
  console.log('Response from updating PR:', res);
  if (res.ok) {
   console.log(`PR ${id} updated successfully.`);
   fetchPrs();
   console.log(`PR ${id} status updated to ${status}`);
  } else {
   console.log(`Failed to update PR ${id}:`, await res.text());
   const error = await res.text();
   console.log('Error updating PR:', error);
   throw new Error(`Failed to update PR: ${error}`);
  }
 };

 return { prs, loading, createPr, updatePrStatus };
};