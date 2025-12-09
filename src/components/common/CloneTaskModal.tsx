// src/components/modals/CloneTaskModal.tsx
import { useEffect, useState } from 'react';
import { db } from '../../db/dexieDB';
import { X, Copy, Type, FileText, GitBranch, Calendar } from 'lucide-react';
import { useRepositories } from '../../db/repositoriesStore';
import { useBranches } from '../../db/branchesStore';
import { toast } from '../common/ToastStack';

interface CloneTaskModalProps {
  taskId: number;
  onClose: () => void;
  onCloned?: () => void;
}

export default function CloneTaskModal({ taskId, onClose, onCloned }: CloneTaskModalProps) {
  const { repositories } = useRepositories();
  const { branches } = useBranches();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    db.tasks.get(taskId).then(setTask);
  }, [taskId]);

  const handleClone = async () => {
    if (!task) return;

    setLoading(true);
    try {
      // Clonar sin ID, completado = false, horas = 0, fecha = hoy
      const newTask = {
        ...task,
        id: undefined,
        completed: false,
        hours: task.type === 'VACACIONES' ? 8 : 0,
        date: new Date().toISOString().substring(0, 10)
      };
      await db.tasks.add(newTask);
      toast('📋 Tarea clonada correctamente.', 'success');
      onCloned?.();
      onClose();
    } catch (err) {
      console.error('Error cloning task:', err);
      toast('❌ Error al clonar la tarea.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  // Encontrar nombre del repositorio si existe
  const repoName = task.repositoryId
    ? repositories.find(r => r.id === task.repositoryId)?.name
    : null;

  // ✅ NUEVA LÓGICA: ramas para "Rama base (To merge in...)" al clonar
  const filteredBranches = task.repositoryId
    ? [
      // Ramas específicas del repositorio de la tarea original (excluyendo las de DbVersion)
      ...branches.filter(b => b.repositoryId === Number(task.repositoryId) && b.repositoryId !== 1),
      // Ramas por defecto (repositoryId = 1) → siempre disponibles
      ...branches.filter(b => b.repositoryId === 1)
    ]
    : branches; // Si no hay repositoryId, mostramos todas (comportamiento fallback)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
              <Copy className="text-emerald-600 dark:text-emerald-400" size={18} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Clonar tarea</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* Tipo de tarea (solo informativo) */}
          {task.type && (
            <div className="mb-4">
              <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {task.type}
              </span>
            </div>
          )}

          {/* Nombre */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Type size={14} /> Nombre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={task.name}
              onChange={(e) => setTask({ ...task, name: e.target.value })}
            />
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <FileText size={14} /> Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Repositorio (solo informativo si existe) */}
          {repoName && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Repositorio
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300">
                {repoName}
              </div>
            </div>
          )}

          {/* Rama de trabajo */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <GitBranch size={14} /> Rama de trabajo
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={task.branch}
              onChange={(e) => setTask({ ...task, branch: e.target.value })}
            />
          </div>

          {/* Rama base (To merge in...) — ✅ AHORA FILTRADO */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Rama base (To merge in...)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              value={task.mergeIn || ''}
              onChange={(e) => setTask({ ...task, mergeIn: e.target.value })}
            >
              <option value="">Seleccionar rama base</option>
              {filteredBranches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} {b.base && `(← ${b.base})`}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de la nueva tarea (siempre hoy) */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Calendar size={14} />
              <span>La tarea clonada se asignará a hoy</span>
            </div>
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleClone}
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-medium transition-colors ${loading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
          >
            {loading ? 'Clonando...' : 'Clonar tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}