// src/components/JiraCommentsModal.tsx
import { X } from 'lucide-react';
import JiraComment from './JiraComment';
import { JiraAttachment } from '../hooks/useJiraIssue';

interface JiraCommentsModalProps {
 comments: any[]; // Cambiamos a any porque el body es un objeto ADF en v3
 attachments?: JiraAttachment[]; // Opcional: para cruzar IDs de media con URLs reales
 onClose: () => void;
}

export default function JiraCommentsModal({ comments, attachments, onClose }: JiraCommentsModalProps) {
 return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
   <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
     <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
      Comentarios de Jira ({comments.length})
     </h3>
     <button
      onClick={onClose}
      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
     >
      <X size={20} />
     </button>
    </div>

    <div className="p-4 overflow-y-auto flex-1">
     {comments.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
       No hay comentarios.
      </p>
     ) : (
      <div className="space-y-4">
       {comments.map((comment, index) => (
        <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
         {/* Pasamos también los adjuntos del issue para que el comment pueda buscar la imagen */}
         <JiraComment comment={comment} allAttachments={attachments} />
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 );
}