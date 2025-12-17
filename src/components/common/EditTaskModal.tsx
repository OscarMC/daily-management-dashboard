// src/components/modals/EditTaskModal.tsx
import { useEffect, useState } from 'react';
import { db } from '../../db/dexieDB';
import { X, Calendar, Clock, GitBranch, FolderGit2, Type } from 'lucide-react';
import { useRepositories } from '../../db/repositoriesStore';
import { useBranches } from '../../db/branchesStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from '../common/ToastStack';
import PrRegistrationModal from '../PrRegistrationModal';
import { usePullRequests, PullRequest } from '../../hooks/usePullRequests';

interface EditTaskModalProps {
  taskId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function EditTaskModal({ taskId, onClose, onUpdated }: EditTaskModalProps) {
  const { repositories } = useRepositories();
  const { branches } = useBranches();
  const { createPr } = usePullRequests();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [taskSaved, setTaskSaved] = useState<{ id: number; name: string; branch: string; repositoryId: string } | null>(null);
  const [showPrModal, setShowPrModal] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
  ];

  useEffect(() => {
    db.tasks.get(taskId).then((t) => {
      if (t) {
        setTask({
          ...t,
          repositoryId: t.repositoryId?.toString() || '',
        });
      }
    });
  }, [taskId]);

  const handleSave = async () => {
    if (!task?.name?.trim()) {
      toast('⚠️ El nombre es obligatorio.', 'warn');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ...task,
        userId: task.userId,
        repositoryId: task.repositoryId ? Number(task.repositoryId) : undefined,
        hours: Number(task.hours) || 0,
      };

      await db.tasks.update(taskId, updateData);

      // ������ Verificar si es WIGOS y tiene datos para PR
      if (task.type === 'WIGOS' && task.repositoryId && task.branch?.trim()) {
        setTaskSaved({
          id: taskId,
          name: task.name,
          branch: task.branch,
          repositoryId: task.repositoryId,
        });
      } else {
        toast('✅ Tarea actualizada correctamente.', 'success');
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Error updating task:', err);
      toast('❌ Error al actualizar la tarea.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  const filteredBranches = task.repositoryId
    ? [
      ...branches.filter(b => b.repositoryId === Number(task.repositoryId) && b.repositoryId !== 1),
      ...branches.filter(b => b.repositoryId === 1)
    ]
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[100vh] h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
              <Type className="text-blue-600 dark:text-blue-400" size={18} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Editar tarea{task.type !== 'OTROS' && ` (${task.type})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {taskSaved && !showPrModal ? (
            <div className="text-center py-4 h-full flex flex-col items-center justify-center">
              <div className="mb-4 text-green-600 dark:text-green-400 font-medium">
                ✅ Tarea actualizada correctamente.
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    toast('✅ Tarea actualizada.', 'success');
                    if (onUpdated) onUpdated();
                    onClose();
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setShowPrModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  ��� Registrar PR para seguimiento ���
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={task.name}
                  onChange={(e) => setTask({ ...task, name: e.target.value })}
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Descripción (HTML WYSIWYG)
                </label>
                <div
                  className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={task.description || ''}
                    onChange={(value) => setTask({ ...task, description: value })}
                    modules={modules}
                    formats={formats}
                    className="dark-theme-editor"
                    style={{
                      height: '280px',
                      maxHeight: '40vh',
                      minHeight: '150px',
                      backgroundColor: '#1f2937',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      padding: '0.5rem',
                    }}
                    bounds=".dark-theme-editor"
                    placeholder="Escribe aquí..."
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Calendar size={14} /> Fecha
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={task.date}
                  onChange={(e) => setTask({ ...task, date: e.target.value })}
                />
              </div>

              {task.type !== 'VACACIONES' && (
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
                    className="w-full px-3 py-2 border border-gray-30"
                  />
                </div>
              )}

              {task.type === 'WIGOS' && (
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                      <FolderGit2 size={14} /> Repositorio
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={task.repositoryId}
                      onChange={(e) =>
                        setTask({
                          ...task,
                          repositoryId: e.target.value,
                          mergeIn: '',
                        })
                      }
                    >
                      <option value="">Seleccionar repositorio</option>
                      {repositories.map((repo) => (
                        <option key={repo.id} value={repo.id}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {task.repositoryId && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                        <GitBranch size={14} /> Rama base
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        value={task.mergeIn || ''}
                        onChange={(e) => setTask({ ...task, mergeIn: e.target.value })}
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

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Rama de trabajo
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={task.branch}
                      onChange={(e) => setTask({ ...task, branch: e.target.value })}
                      placeholder="feature/sln2/..."
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!taskSaved && (
          <div className="p-5 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={loading || !task.name.trim()}
              className={`w-full py-2.5 rounded-lg font-medium transition-colors ${loading || !task.name.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {/* PR Registration Modal */}
      {showPrModal && taskSaved && (
        <PrRegistrationModal
          taskId={String(taskSaved.id)}
          taskTitle={taskSaved.name}
          repositoryId={taskSaved.repositoryId}
          branch={taskSaved.branch}
          onClose={() => {
            setShowPrModal(false);
            if (onUpdated) onUpdated();
            onClose();
          }}
          onSave={async (pr) => {
            try {
              await createPr(pr);
              toast('✅ PR registrado correctamente.', 'success');
              setShowPrModal(false);
              if (onUpdated) onUpdated();
              onClose();
            } catch (err) {
              console.error('Error saving PR:', err);
              toast('❌ Error al registrar el PR.', 'error');
            }
          }}
        />
      )}
    </div>
  );
}