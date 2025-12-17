// src/components/PrRegistrationModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';

interface PrRegistrationModalProps {
 taskId: string;
 taskTitle: string;
 repositoryId: string;
 branch: string;
 onClose: () => void;
 onSave: (pr: {
  taskId: string;
  title: string;
  repositoryId: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'pending' | 'in-review' | 'approved' | 'merged' | 'blocked';
  externalUrl?: string;
  notes?: string;
 }) => void;
}

export default function PrRegistrationModal({
 taskId,
 taskTitle,
 repositoryId,
 branch,
 onClose,
 onSave,
}: PrRegistrationModalProps) {
 const [title, setTitle] = useState(taskTitle);
 const [targetBranch, setTargetBranch] = useState('master');
 const [externalUrl, setExternalUrl] = useState('');
 const [notes, setNotes] = useState('');

 const handleSubmit = () => {
  if (!title.trim()) return;
  onSave({
   taskId: taskId?taskId:'1',
   title: title.trim(),
   repositoryId: repositoryId ? repositoryId : '1',
   sourceBranch: branch ? branch : 'test-branch',
   targetBranch: targetBranch.trim(),
   status: 'pending',
   externalUrl: externalUrl.trim() || 'http://example.com/test-pr',
   notes: notes.trim() || 'test note',
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
       value={branch?branch:'test-branch'}
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
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
       placeholder="master, development, ..."
      />
     </div>

     <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
       Enlace a Bitbucket / Jira (opcional)
      </label>
      <input
       type="url"
       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       value={externalUrl}
       onChange={(e) => setExternalUrl(e.target.value)}
       placeholder="https://bitbucket.org/..."
      />
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