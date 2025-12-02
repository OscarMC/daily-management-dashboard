import { useState, useEffect } from 'react'
import repositoriesData from '../data/repositories.json'

export interface Repository {
 id: number
 name: string
}

export function useRepositories() {
 const [repositories, setRepositories] = useState<Repository[]>(repositoriesData)

 const addRepository = async (name: string) => {
  const nextId = repositories.length
   ? Math.max(...repositories.map(r => r.id)) + 1
   : 1
  const updated = [...repositories, { id: nextId, name }]
  setRepositories(updated)
  localStorage.setItem('repositories', JSON.stringify(updated))
 }

 const updateRepository = async (id: number, name: string) => {
  const updated = repositories.map(r =>
   r.id === id ? { ...r, name } : r
  )
  setRepositories(updated)
  localStorage.setItem('repositories', JSON.stringify(updated))
 }

 const deleteRepository = async (id: number) => {
  const updated = repositories.filter(r => r.id !== id)
  setRepositories(updated)
  localStorage.setItem('repositories', JSON.stringify(updated))
 }

 useEffect(() => {
  const stored = localStorage.getItem('repositories')
  if (stored) setRepositories(JSON.parse(stored))
 }, [])

 return { repositories, addRepository, updateRepository, deleteRepository }
}
