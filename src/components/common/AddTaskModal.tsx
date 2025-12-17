// src/components/modals/AddTaskModal.tsx
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/dexieDB';
import { X, Calendar, Clock, GitBranch, FolderGit2, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRepositories } from '../../db/repositoriesStore';
import { useBranches } from '../../db/branchesStore';
import { toast } from '../common/ToastStack';
import { useAuth } from '../../contexts/AuthContext';

interface AddTaskModalProps {
   onClose: () => void;
   onAdded: () => void;
   date?: string;
}

export default function AddTaskModal({ onClose, onAdded, date: initialDate }: AddTaskModalProps) {
   const { t } = useTranslation();
   const { repositories } = useRepositories();
   const { branches } = useBranches();
   const { user } = useAuth();

   const today = new Date().toISOString().substring(0, 10);
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [branch, setBranch] = useState('');
   const [mergeIn, setMergeIn] = useState('');
   const [hours, setHours] = useState<number>(0);
   const [date, setDate] = useState<string>(initialDate || today);
   const [repositoryId, setRepositoryId] = useState<string>('');
   const [taskType, setTaskType] = useState<'WIGOS' | 'VACACIONES' | 'OTROS'>('OTROS');
   const [suggestedBranch, setSuggestedBranch] = useState('');

   const [hasVacation, setHasVacation] = useState(false);
   const [loading, setLoading] = useState(false);

   // 👇 Nuevo estado para controlar la pantalla post-creación
   const [taskCreated, setTaskCreated] = useState<{
      id: string;
      name: string;
      branch: string;
      repositoryId: string;
   } | null>(null);

   const checkVacationConflict = useCallback(async () => {
      if (date) {
         const existing = await db.tasks
            .where('date')
            .equals(date)
            .filter(task => task.type === 'VACACIONES')
            .toArray();
         setHasVacation(existing.length > 0);
      }
   }, [date]);

   useEffect(() => {
      checkVacationConflict();
   }, [checkVacationConflict]);

   const getNextTaskId = async () => {
      let counter = Number(localStorage.getItem('TASK_COUNTER') || '0');
      counter++;
      localStorage.setItem('TASK_COUNTER', String(counter));
      return `TASK-${String(counter).padStart(5, '0')}`;
   };

   useEffect(() => {
      if (taskType === 'WIGOS' && name.trim() && repositoryId) {
         const jiraMatch = name.match(/^(WIGOS-\d{4,7})/i);
         if (jiraMatch) {
            const prefix = jiraMatch[1].toLowerCase();
            const cleanName = name
               .substring(jiraMatch[0].length)
               .replace(/[^a-zA-Z0-9\s]/g, ' ')
               .trim()
               .toLowerCase()
               .replace(/\s+/g, '_');
            const fullKey = cleanName ? `${prefix}_${cleanName}` : prefix;
            const newSuggestion = `feature/sln2/${fullKey}`;
            setSuggestedBranch(newSuggestion);
            if (!branch.trim()) {
               setBranch(newSuggestion);
            }
         } else {
            setSuggestedBranch('feature/sln2/[nombre]');
            if (!branch.trim()) {
               setBranch('feature/sln2/[nombre]');
            }
         }
      } else {
         setSuggestedBranch('');
      }
   }, [name, taskType, repositoryId, branch]);

   const handleSubmit = async () => {
      if (!name.trim()) {
         toast('⚠️ El nombre es obligatorio.', 'warn');
         return;
      }

      if (taskType === 'VACACIONES' && hasVacation) {
         toast('❌ Ya tienes vacaciones asignadas en esta fecha.', 'error');
         return;
      }

      if (!user) {
         toast('❌ Usuario no autenticado.', 'error');
         return;
      }

      setLoading(true);
      try {
         const jiraMatch = name.match(/^(WIGOS-\d{4,7})/i);
         const itemId = jiraMatch ? jiraMatch[1] : await getNextTaskId();
         const isVacation = taskType === 'VACACIONES';
         const taskHours = isVacation ? 8 : hours || 0;

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
            type: taskType as 'WIGOS' | 'VACACIONES' | 'OTROS',
            userId: user.id,
         };

         const taskId = await db.tasks.add(newTask);

         // 👇 Solo mostrar opción de PR si es WIGOS y tiene datos completos
         if (taskType === 'WIGOS' && repositoryId && branch.trim()) {
            setTaskCreated({
               id: taskId.toString(),
               name: newTask.name,
               branch: newTask.branch,
               repositoryId: String(newTask.repositoryId),
            });
         } else {
            toast('✅ Tarea creada correctamente.', 'success');
            onAdded();
            onClose();
         }
      } catch (err) {
         console.error('Error creating task:', err);
         toast('❌ Error al crear la tarea.', 'error');
      } finally {
         setLoading(false);
      }
   };

   const filteredBranches = repositoryId
      ? [
         ...branches.filter(b => b.repositoryId === Number(repositoryId) && b.repositoryId !== 1),
         ...branches.filter(b => b.repositoryId === 1),
      ]
      : [];

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[100vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                     <Type className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                     {t('tasks.new')} {taskType !== 'OTROS' && `(${taskType})`}
                  </h3>
               </div>
               <button
                  onClick={onClose}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
               >
                  <X size={20} />
               </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
               {taskCreated ? (
                  <div className="text-center py-4">
                     <div className="mb-4 text-green-600 dark:text-green-400 font-medium">
                        ✅ Tarea creada correctamente.
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                        <button
                           onClick={() => {
                              toast('✅ Tarea creada.', 'success');
                              onAdded();
                              onClose();
                           }}
                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                           Cerrar
                        </button>
                        <button
                           onClick={() => {
                              console.log('Creating PR for task:', taskCreated);
                              onAdded();
                              console.log('Task created, proceeding to PR registration.');
                              onClose();
                              console.log('Modal closed, redirecting to PRs page.');
                              // Redirige a /prs con parámetros para pre-rellenar (opcional, mejorable más adelante)
                              const url = `/prs?taskId=${taskCreated.id}&title=${encodeURIComponent(taskCreated.name)}&branch=${encodeURIComponent(taskCreated.branch)}&repo=${taskCreated.repositoryId}`;
                              console.log('Redirecting to PRs page with URL:', url);
                              window.location.hash = url;
                           }}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                           📌 Registrar PR para seguimiento
                        </button>
                     </div>
                  </div>
               ) : (
                  <>
                     {/* Tipo de tarea */}
                     <div className="mb-5">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                           Tipo de tarea
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                           {(['WIGOS', 'VACACIONES', 'OTROS'] as const).map((type) => (
                              <button
                                 key={type}
                                 type="button"
                                 onClick={() => setTaskType(type)}
                                 className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${taskType === type
                                       ? 'bg-blue-600 text-white'
                                       : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                              >
                                 {type}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Fecha */}
                     <div className="mb-4">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                           <Calendar size={14} /> Fecha
                        </label>
                        <input
                           type="date"
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           value={date}
                           onChange={(e) => setDate(e.target.value)}
                        />
                        {taskType === 'VACACIONES' && hasVacation && (
                           <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              ⚠️ Ya tienes vacaciones en esta fecha.
                           </p>
                        )}
                     </div>

                     {/* Nombre */}
                     <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                           Nombre
                        </label>
                        <input
                           type="text"
                           placeholder={
                              taskType === 'WIGOS'
                                 ? 'WIGOS-123456 - Descripción de la tarea'
                                 : taskType === 'VACACIONES'
                                    ? 'Vacaciones - Semana Santa'
                                    : 'Nombre de la tarea'
                           }
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                        />
                     </div>

                     {/* Descripción */}
                     <div className="mb-5">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                           Descripción
                        </label>
                        <textarea
                           placeholder="Detalles adicionales..."
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           rows={2}
                        />
                     </div>

                     {/* Campos específicos por tipo */}
                     {taskType === 'WIGOS' && (
                        <div className="space-y-4 mb-5">
                           <div>
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                 <FolderGit2 size={14} /> Repositorio
                              </label>
                              <select
                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                           </div>

                           {repositoryId && (
                              <div>
                                 <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                    <GitBranch size={14} /> Rama base
                                 </label>
                                 <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    value={mergeIn}
                                    onChange={(e) => setMergeIn(e.target.value)}
                                 >
                                    <option value="">To merge in...</option>
                                    {filteredBranches.map((b) => (
                                       <option key={b.id} value={b.name}>
                                          {b.name} {b.base && `(← ${b.base})`}
                                       </option>
                                    ))}
                                 </select>
                              </div>
                           )}

                           {/* Rama de trabajo */}
                           <div>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                 Rama de trabajo
                              </label>
                              <input
                                 type="text"
                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 value={branch}
                                 onChange={(e) => setBranch(e.target.value)}
                                 placeholder="feature/sln2/..."
                              />
                           </div>
                        </div>
                     )}

                     {taskType !== 'VACACIONES' && (
                        <div className="mb-5">
                           <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                              <Clock size={14} /> Horas
                           </label>
                           <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.25"
                              placeholder="0.0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={hours || ''}
                              onChange={(e) => setHours(Number(e.target.value) || 0)}
                           />
                        </div>
                     )}

                     <button
                        onClick={handleSubmit}
                        disabled={loading || (taskType === 'VACACIONES' && hasVacation) || !name.trim() || !user}
                        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${loading || (taskType === 'VACACIONES' && hasVacation) || !name.trim() || !user
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                           }`}
                     >
                        {loading ? 'Creando...' : 'Crear tarea'}
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}