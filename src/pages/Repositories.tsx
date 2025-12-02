import { useState } from 'react'
import { Pencil, Trash2, PlusCircle, Save } from 'lucide-react'
import { useRepositories } from '../db/repositoriesStore'
import { useToastStack, toast } from '../components/common/ToastStack'

export default function Repositories() {
 const { repositories, addRepository, updateRepository, deleteRepository } = useRepositories()
 const [newRepo, setNewRepo] = useState('')
 const [editingId, setEditingId] = useState<number | null>(null)
 const [editingName, setEditingName] = useState('')
 const { ToastContainer } = useToastStack()

 const handleAdd = async () => {
  const trimmed = newRepo.trim()
  if (!trimmed) {
   toast('Repository name cannot be empty.', 'warn')
   return
  }

  const exists = repositories.some(r => r.name === trimmed)
  if (exists) {
   toast(`Repository "${trimmed}" already exists.`, 'warn')
   return
  }

  await addRepository(trimmed)
  toast(`Repository "${trimmed}" added successfully.`, 'success')
  setNewRepo('')
 }

 const handleSaveEdit = async (id: number) => {
  const trimmed = editingName.trim()
  if (!trimmed) {
   toast('Repository name cannot be empty.', 'warn')
   return
  }

  const exists = repositories.some(r => r.name === trimmed && r.id !== id)
  if (exists) {
   toast(`Repository "${trimmed}" already exists.`, 'warn')
   return
  }

  const oldRepo = repositories.find(r => r.id === id)
  await updateRepository(id, trimmed)
  toast(
   `Repository "${oldRepo?.name}" renamed to "${trimmed}".`,
   'info'
  )
  setEditingId(null)
  setEditingName('')
 }

 const handleDelete = async (id: number) => {
  const repo = repositories.find(r => r.id === id)
  await deleteRepository(id)
  toast(`Repository "${repo?.name}" deleted.`, 'warn')
 }

 return (
  <div className="p-6 relative">
   <ToastContainer />

   <h2 className="text-xl font-semibold mb-4">Repositories</h2>

   {/* Alta */}
   <div className="flex gap-2 mb-4">
    <input
     type="text"
     placeholder="New repository name (case-sensitive)"
     className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
     value={newRepo}
     onChange={(e) => setNewRepo(e.target.value)}
    />
    <button
     onClick={handleAdd}
     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"
    >
     <PlusCircle size={16} /> Add
    </button>
   </div>

   {/* Lista */}
   {repositories.length > 0 ? (
    <div className="space-y-3">
     {repositories.map((r) => (
      <div
       key={r.id}
       className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
      >
       {editingId === r.id ? (
        <input
         type="text"
         value={editingName}
         onChange={(e) => setEditingName(e.target.value)}
         className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
        />
       ) : (
        <span className="font-medium">{r.name}</span>
       )}

       <div className="flex gap-2">
        {editingId === r.id ? (
         <button
          onClick={() => handleSaveEdit(r.id)}
          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded"
          title="Save changes"
         >
          <Save size={16} />
         </button>
        ) : (
         <button
          onClick={() => {
           setEditingId(r.id)
           setEditingName(r.name)
          }}
          className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
          title="Edit repository"
         >
          <Pencil size={16} />
         </button>
        )}
        <button
         onClick={() => handleDelete(r.id)}
         className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
         title="Delete repository"
        >
         <Trash2 size={16} />
        </button>
       </div>
      </div>
     ))}
    </div>
   ) : (
    <p className="text-gray-500 italic">No repositories added yet.</p>
   )}
  </div>
 )
}
