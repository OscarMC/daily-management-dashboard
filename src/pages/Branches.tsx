import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useBranches } from '../db/branchesStore'
import { useRepositories } from '../db/repositoriesStore'
import { toast, useToastStack } from '../components/common/ToastStack'

export default function Branches() {
 const { branches, addBranch, updateBranch, deleteBranch } = useBranches()
 const { repositories } = useRepositories()
 

 const [newBranch, setNewBranch] = useState({
  name: '',
  base: '',
  description: '',
  repositoryId: ''
 })
 const [editingId, setEditingId] = useState<number | null>(null)

 const handleAdd = () => {
  if (!newBranch.name.trim()) {
   toast('⚠️ El nombre de la rama es obligatorio.', 'warn')
   return
  }
  addBranch({
   name: newBranch.name,
   base: newBranch.base,
   description: newBranch.description,
   repositoryId: newBranch.repositoryId ? Number(newBranch.repositoryId) : undefined
  })
  setNewBranch({ name: '', base: '', description: '', repositoryId: '' })
  toast('✅ Rama creada correctamente.', 'success')
 }

 const handleUpdate = (id: number, field: string, value: string) => {
  updateBranch(id, { [field]: value })
  toast('💾 Cambios guardados.', 'info')
 }

 const handleDelete = (id: number) => {
  deleteBranch(id)
  toast('🗑️ Rama eliminada correctamente.', 'warn')
 }

 return (
  <div className="p-6">
   <h2 className="text-xl font-semibold mb-4">Branches</h2>

   {/* Nueva rama */}
   <div className="flex flex-wrap gap-2 mb-6 items-center">
    <input
     type="text"
     placeholder="Nombre de rama"
     className="p-2 border rounded bg-gray-50 dark:bg-gray-700"
     value={newBranch.name}
     onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
    />
    <input
     type="text"
     placeholder="Rama base (ej. develop)"
     className="p-2 border rounded bg-gray-50 dark:bg-gray-700"
     value={newBranch.base}
     onChange={(e) => setNewBranch({ ...newBranch, base: e.target.value })}
    />
    <input
     type="text"
     placeholder="Descripción"
     className="p-2 border rounded bg-gray-50 dark:bg-gray-700 w-80"
     value={newBranch.description}
     onChange={(e) => setNewBranch({ ...newBranch, description: e.target.value })}
    />
    <select
     className="p-2 border rounded bg-gray-50 dark:bg-gray-700"
     value={newBranch.repositoryId}
     onChange={(e) => setNewBranch({ ...newBranch, repositoryId: e.target.value })}
    >
     <option value="">Sin repositorio</option>
     {repositories.map((r) => (
      <option key={r.id} value={r.id}>
       {r.name}
      </option>
     ))}
    </select>
    <button
     onClick={handleAdd}
     className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
     <Plus size={16} /> Añadir
    </button>
   </div>

   {/* Lista de ramas */}
   <div className="space-y-2">
    {branches.map((b) => (
     <div
      key={b.id}
      className="flex flex-wrap justify-between items-center p-4 border rounded bg-gray-100 dark:bg-gray-800 shadow-sm"
     >
      <div className="flex flex-col gap-1 w-full md:w-3/4">
       <input
        type="text"
        className="font-semibold bg-transparent border-none focus:ring-0"
        value={b.name}
        onChange={(e) => handleUpdate(b.id, 'name', e.target.value)}
       />
       <div className="text-sm text-gray-600 dark:text-gray-400">
        Base:
        <input
         type="text"
         className="ml-2 bg-transparent border-b border-gray-400 focus:outline-none"
         value={b.base}
         onChange={(e) => handleUpdate(b.id, 'base', e.target.value)}
        />
       </div>
       <textarea
        className="text-sm bg-transparent border-b border-gray-400 focus:outline-none mt-1"
        value={b.description}
        onChange={(e) => handleUpdate(b.id, 'description', e.target.value)}
       />
       {b.repositoryId && (
        <p className="text-xs text-gray-500 mt-1">
         Repo vinculado:{' '}
         <span className="font-mono">
          {repositories.find((r) => r.id === b.repositoryId)?.name || 'Desconocido'}
         </span>
        </p>
       )}
      </div>

      <div className="flex gap-3 mt-2 md:mt-0">
       <button
        onClick={() => setEditingId(b.id)}
        className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
        title="Editar"
       >
        <Pencil size={16} />
       </button>
       <button
        onClick={() => handleDelete(b.id)}
        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
        title="Eliminar"
       >
        <Trash2 size={16} />
       </button>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
