import { useState } from 'react'
import { Plus } from 'lucide-react'
import TaskList from '../components/common/TaskList'
import AddTaskModal from '../components/common/AddTaskModal'

export default function Tasks() {
 const [showModal, setShowModal] = useState(false)
 const [refresh, setRefresh] = useState(0)

 const handleAdded = () => {
  // Refrescar el listado de tareas
  setRefresh((r) => r + 1)
 }

 return (
  <div>
   <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Daily Tasks</h2>
    <button
     onClick={() => setShowModal(true)}
     className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
    >
     <Plus className="w-5 h-5" />
     Add Task
    </button>
   </div>

   <TaskList key={refresh} />

   {showModal && (
    <AddTaskModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
   )}
  </div>
 )
}
