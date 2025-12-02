import { useEffect, useState } from 'react'
import { db } from '../../db/dexieDB'
import { X } from 'lucide-react'
import { useRepositories } from '../../db/repositoriesStore'
import { useBranches } from '../../db/branchesStore'
import { toast } from '../common/ToastStack'

interface CloneTaskModalProps {
 taskId: number
 onClose: () => void
}

export default function CloneTaskModal({ taskId, onClose }: CloneTaskModalProps) {
 const { repositories } = useRepositories()
 const { branches } = useBranches()

 const [task, setTask] = useState<any>(null)

 useEffect(() => {
  db.tasks.get(taskId).then(setTask)
 }, [taskId])

 const handleClone = async () => {
  const newTask = { ...task, id: undefined, completed: false, hours: 0, date: new Date().toISOString().substring(0, 10) }
  await db.tasks.add(newTask)
  toast('📋 Tarea clonada correctamente.', 'success')
  onClose()
 }

 if (!task) return null

 return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[420px] p-6">
    <div className="flex justify-between items-center mb-4">
     <h3 className="text-lg font-semibold">Clonar tarea</h3>
     <button onClick={onClose}>
      <X className="w-5 h-5" />
     </button>
    </div>

    <input
     type="text"
     className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700"
     value={task.name}
     onChange={(e) => setTask({ ...task, name: e.target.value })}
    />
    <textarea
     className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700 h-24"
     value={task.description}
     onChange={(e) => setTask({ ...task, description: e.target.value })}
    />
    <input
     type="text"
     placeholder="Branch"
     className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700"
     value={task.branch}
     onChange={(e) => setTask({ ...task, branch: e.target.value })}
    />

    {/* Campo nuevo To merge in... */}
    <select
     className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700"
     value={task.mergeIn || ''}
     onChange={(e) => setTask({ ...task, mergeIn: e.target.value })}
    >
     <option value="">To merge in...</option>
     {branches.map((b) => (
      <option key={b.id} value={b.name}>
       {b.name} ({b.base})
      </option>
     ))}
    </select>

    <button
     onClick={handleClone}
     className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
    >
     Confirmar clonación
    </button>
   </div>
  </div>
 )
}
