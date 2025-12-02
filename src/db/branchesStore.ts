import { useState, useEffect } from 'react'
import branchesData from '../data/branches.json'

export interface Branch {
 id: number
 name: string
 base: string
 description: string
 repositoryId?: number
}

export function useBranches() {
 const [branches, setBranches] = useState<Branch[]>([])

 // Cargar ramas desde el JSON local
 useEffect(() => {
  setBranches(branchesData)
 }, [])

 const addBranch = (branch: Omit<Branch, 'id'>) => {
  const newBranch = { ...branch, id: Date.now() }
  setBranches((prev) => [...prev, newBranch])
 }

 const updateBranch = (id: number, updated: Partial<Branch>) => {
  setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)))
 }

 const deleteBranch = (id: number) => {
  setBranches((prev) => prev.filter((b) => b.id !== id))
 }

 return { branches, addBranch, updateBranch, deleteBranch }
}
