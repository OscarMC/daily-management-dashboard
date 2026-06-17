// JiraLinksModal.tsx
import React from 'react';
import { X, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';


interface JiraIssueLink {
 id: string;
 type: {
  id?: string;
  name?: string;
  inward?: string;
  outward?: string;
 } | string;
 inwardIssue?: any;
 outwardIssue?: any;
}

interface JiraLinksModalProps {
 links: JiraIssueLink[];
 onClose: () => void;
}

export default function JiraLinksModal({ links, onClose }: JiraLinksModalProps) {
 return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
   <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
     <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      <ExternalLink size={20} className="text-indigo-500" />
      Issue Links ({links.length})
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
      {links.map((link) => (
       <div
        key={link.id}
        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
       >
        <div className="flex-1">
         <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {link.type.toString()}
         </div>
         <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          {link.inwardIssue && (
           <div className="flex items-center gap-1">
            <ArrowLeft size={14} />
            <a
             href={`https://winsytemsintl.atlassian.net/browse/${link.inwardIssue}`}
             target="_blank"
             rel="noopener noreferrer"
             className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
            >
             {link.inwardIssue}
            </a>
           </div>
          )}
          {link.outwardIssue && (
           <div className="flex items-center gap-1">
            <ArrowRight size={14} />
            <a
             href={`https://winsytemsintl.atlassian.net/browse/${link.outwardIssue}`}
             target="_blank"
             rel="noopener noreferrer"
             className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
            >
             {link.outwardIssue}
            </a>
           </div>
          )}
         </div>
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>
  </div>
 );
}