import { useLiveQuery } from 'dexie-react-hooks'
import { db, Task } from '../../db/dexieDB'
import ProgressBar from './ProgressBar'
import { CheckSquare, Square, Trash2, Pencil } from 'lucide-react'
import { useState } from 'react'
import EditTaskModal from './EditTaskModal'

export default function TaskList() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), [])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [refresh, setRefresh] = useState(0)

  const toggleComplete = async (task: Task) => {
    await db.tasks.update(task.id!, { completed: !task.completed })
  }

  const deleteTask = async (task: Task) => {
    await db.tasks.delete(task.id!)
  }

  if (!tasks?.length) {
    return <p className="text-gray-500 dark:text-gray-400">No tasks yet.</p>
  }

  const today = new Date().toISOString().substring(0, 10)
  const todaysTasks = tasks.filter((t) => t.date === today)

  const completedHours = todaysTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + (t.hours || 0), 0)

  const weekday = new Date(today).getDay()
  const dailyTarget = weekday >= 1 && weekday <= 4 ? 8.5 : weekday === 5 ? 6 : 0
  const progress = dailyTarget > 0 ? Math.min((completedHours / dailyTarget) * 100, 100) : 0

  return (
    <div className="space-y-4">
      <ProgressBar value={progress} />
      {todaysTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
        >
          <div>
            <h3 className="font-medium">{task.name}</h3>
            <p className="text-sm opacity-70">{task.description}</p>
            <p className="text-xs mt-1 italic text-gray-500">
              Branch: {task.branch} • {task.hours}h • {task.date}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleComplete(task)}>
              {task.completed ? (
                <CheckSquare className="w-5 h-5 text-green-500" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button onClick={() => setSelectedTask(task)}>
              <Pencil className="w-5 h-5 text-blue-500" />
            </button>
            <button onClick={() => deleteTask(task)}>
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      ))}

      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => setRefresh((r) => r + 1)}
        />
      )}
    </div>
  )
}
