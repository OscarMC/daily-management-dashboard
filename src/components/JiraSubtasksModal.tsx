// JiraSubtasksModal.tsx
import React from 'react';
import { X, CheckSquare, ExternalLink } from 'lucide-react';

interface Subtask {
 id: string;
 key: string;
 summary: string;
 status: string;
}

interface JiraSubtasksModalProps {
 subtasks: Subtask[];
 onClose: () => void;
}

export default function JiraSubtasksModal({ subtasks, onClose }: JiraSubtasksModalProps) {
 const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('done') || s.includes('finaliz')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (s.includes('progress') || s.includes('curso')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
 };

 return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
   <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
     <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      <CheckSquare size={20} className="text-green-500" />
      Subtareas ({subtasks.length})
     </h3>
     <button
      onClick={onClose}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
     >
      <X size={20} />
     </button>
    </div>

    <div className="p-6 overflow-y-auto flex-1">
     <div className="space-y-3">
      {subtasks.map((subtask) => (
       <div
        key={subtask.id}
        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
       >
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
           {subtask.key}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(subtask.status)}`}>
           {subtask.status}
          </span>
         </div>
         <div className="text-sm text-gray-900 dark:text-white">
          {subtask.summary}
         </div>
        </div>

        <a href={`https://winsytemsintl.atlassian.net/browse/${subtask.key}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        title="Abrir en Jira"
                >
        <ExternalLink size={16} className="text-gray-600 dark:text-gray-400" />
       </a>
              </div>
            ))}
    </div>
   </div>
  </div>
    </div >
  );
}