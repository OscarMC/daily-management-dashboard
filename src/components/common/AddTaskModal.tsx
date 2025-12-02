import { useState, useEffect } from 'react'
import { db } from '../../db/dexieDB'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRepositories } from '../../db/repositoriesStore'
import { useBranches } from '../../db/branchesStore'
import { toast } from '../common/ToastStack'

interface AddTaskModalProps {
   onClose: () => void
   onAdded: () => void
}

export default function AddTaskModal({ onClose, onAdded }: AddTaskModalProps) {
   const { t } = useTranslation()
   const { repositories } = useRepositories()
   const { branches } = useBranches()
   

   const [name, setName] = useState('')
   const [description, setDescription] = useState('')
   const [branch, setBranch] = useState('')
   const [mergeIn, setMergeIn] = useState('')
   const [hours, setHours] = useState<number>(0)
   const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10))
   const [repositoryId, setRepositoryId] = useState('')
   const [taskType, setTaskType] = useState<'WIGOS' | 'VACACIONES' | 'OTROS'>('OTROS')

   const getNextTaskId = async () => {
      let counter = Number(localStorage.getItem('TASK_COUNTER') || '0')
      counter++
      localStorage.setItem('TASK_COUNTER', String(counter))
      return `TASK-${String(counter).padStart(5, '0')}`
   }

   const computeTaskType = (taskName: string) => {
      const jiraMatch = taskName.match(/^(WIGOS-\d{4,6})/i)
      if (jiraMatch) setTaskType('WIGOS')
      else if (taskName.toUpperCase().includes('VACACIONES')) setTaskType('VACACIONES')
      else setTaskType('OTROS')
   }

   useEffect(() => {
      computeTaskType(name)
   }, [name])

   const handleSubmit = async () => {
      if (!name.trim()) return

      const jiraMatch = name.match(/^(WIGOS-\d{4,6})/i)
      const itemId = jiraMatch ? jiraMatch[1] : await getNextTaskId()
      const type = taskType
      const isVacation = type === 'VACACIONES'
      const taskHours = isVacation ? 8 : hours || 0

      const newTask = {
         name,
         description,
         branch,
         mergeIn,
         completed: false,
         createdAt: new Date().toISOString(),
         date,
         hours: taskHours,
         itemId,
         repositoryId: jiraMatch ? Number(repositoryId) : undefined,
         type
      }

      await db.tasks.add(newTask)
      toast('✅ Tarea creada correctamente.', 'success')
      onAdded()
      onClose()
   }

   return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[420px] p-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">
                  {t('tasks.new')} {taskType !== 'OTROS' && `(${taskType})`}
               </h3>
               <button onClick={onClose}>
                  <X className="w-5 h-5" />
               </button>
            </div>

            <input
               type="text"
               placeholder="Nombre (WIGOS-XXXXXX - descripción)"
               className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700"
               value={name}
               onChange={(e) => {
                  const val = e.target.value
                  setName(val)
                  computeTaskType(val)
               }}
            />

            <textarea
               placeholder="Descripción"
               className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700 h-24"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
            />

            {/* Campos solo si no es vacaciones */}
            {taskType !== 'VACACIONES' && (
               <>
                  <input
                     type="text"
                     placeholder="Branch"
                     className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700"
                     value={branch}
                     onChange={(e) => setBranch(e.target.value)}
                  />

                  {/* Campo nuevo To merge in... */}
                  <select
                     className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700"
                     value={mergeIn}
                     onChange={(e) => setMergeIn(e.target.value)}
                  >
                     <option value="">To merge in...</option>
                     {branches.map((b) => (
                        <option key={b.id} value={b.name}>
                           {b.name} ({b.base})
                        </option>
                     ))}
                  </select>

                  <input
                     type="number"
                     placeholder="Horas"
                     className="w-full p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700"
                     value={hours}
                     onChange={(e) => setHours(Number(e.target.value))}
                  />
               </>
            )}

            <input
               type="date"
               className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700"
               value={date}
               onChange={(e) => setDate(e.target.value)}
            />

            {taskType === 'WIGOS' && (
               <select
                  className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700"
                  value={repositoryId}
                  onChange={(e) => setRepositoryId(e.target.value)}
               >
                  <option value="">Seleccionar repositorio</option>
                  {repositories.map((repo) => (
                     <option key={repo.id} value={repo.id}>
                        {repo.name}
                     </option>
                  ))}
               </select>
            )}

            <button
               onClick={handleSubmit}
               className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
               Crear tarea
            </button>
         </div>
      </div>
   )
}
