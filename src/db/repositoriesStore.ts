// src/db/repositoriesStore.ts
import { useState, useEffect } from 'react'
import { getRepositories, addRepository, updateRepository, deleteRepository } from './api'

export interface Repository {
 id: number
 name: string
}

export function useRepositories() {
 const [repositories, setRepositories] = useState<Repository[]>([])

 // Cargar repositorios al montar el componente
 useEffect(() => {
  const loadRepositories = async () => {
   try {
    const data = await getRepositories()
    setRepositories(data)
   } catch (err) {
    console.error('Error loading repositories:', err)
    setRepositories([])
   }
  }
  loadRepositories()
 }, [])

 const addRepositoryLocal = async (name: string) => {
  try {
   const newRepo = await addRepository(name)
   setRepositories(prev => [...prev, newRepo])
   return newRepo
  } catch (err) {
   console.error('Error adding repository:', err)
   throw err
  }
 }

 const updateRepositoryLocal = async (id: number, name: string) => {
  try {
   await updateRepository(id, name)
   setRepositories(prev =>
    prev.map(r => (r.id === id ? { ...r, name } : r))
   )
  } catch (err) {
   console.error('Error updating repository:', err)
   throw err
  }
 }

 const deleteRepositoryLocal = async (id: number) => {
  try {
   await deleteRepository(id)
   setRepositories(prev => prev.filter(r => r.id !== id))
  } catch (err) {
   console.error('Error deleting repository:', err)
   throw err
  }
 }

 return {
  repositories,
  addRepository: addRepositoryLocal,
  updateRepository: updateRepositoryLocal,
  deleteRepository: deleteRepositoryLocal,
 }
}