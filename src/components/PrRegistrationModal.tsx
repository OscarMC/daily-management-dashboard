// src/components/PrRegistrationModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';

interface PrRegistrationModalProps {
  taskId: string;
  taskTitle: string;
  repositoryName: string; // 👈 Nombre legible del repo (ej: "wigos.kernel.kioskredemptionwebapi")
  branch: string;
  onClose: () => void;
  onSave: (pr: {
    taskId: string;
    title: string;
    repositoryId: string; // sigue pasando repositoryId si es necesario en el hook
    sourceBranch: string;
    targetBranch: string;
    status: 'pending' | 'in-review' | 'approved' | 'merged' | 'blocked';
    externalUrl?: string;
    notes?: string;
  }) => void;
  repositoryId: string; // si tu hook lo necesita
}

export default function PrRegistrationModal({
  taskId,
  taskTitle,
  repositoryName,
  repositoryId,
  branch,
  onClose,
  onSave,
}: PrRegistrationModalProps) {
  const [title, setTitle] = useState(taskTitle);
  const [targetBranch, setTargetBranch] = useState('development');
  const [prNumber, setPrNumber] = useState(''); // 👈 solo el número
  const [notes, setNotes] = useState('');

  const bitbucketBaseUrl = `https://bitbucket.org/wigos-dev/${repositoryName.toLowerCase()}/pull-requests/`;

  const handleSubmit = () => {
    if (!title.trim()) return;
    // Construir la URL completa solo si se proporciona el número
    const externalUrl = prNumber.trim()
      ? `${bitbucketBaseUrl}${prNumber.trim()}`
      : ''; // o undefined si prefieres

    onSave({
      taskId,
      title: title.trim(),
      repositoryId,
      sourceBranch: branch || 'main',
      targetBranch: targetBranch.trim(),
      status: 'pending',
      externalUrl: externalUrl || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Registrar Pull Request
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Título del PR *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Rama origen
            </label>
            <input
              type="text"
              value={branch || 'main'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Rama destino *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              placeholder="development, master, ..."
            />
          </div>

          {/* Campo compuesto: URL fija + número editable */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Enlace a Bitbucket (opcional)
            </label>
            <div className="flex">
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500 dark:text-gray-400 truncate">
                {bitbucketBaseUrl}
              </div>
              <input
                type="number"
                min="1"
                placeholder="17"
                className="w-24 px-2 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solo introduce el número del pull request (ej: 17)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej: Esperando aprobación de QA"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${!title.trim()
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              Registrar PR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}