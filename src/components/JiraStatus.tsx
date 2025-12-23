// src/components/JiraStatus.tsx
import { useState, useEffect } from 'react';
import { useJiraIssue } from '../hooks/useJiraIssue';
import { JiraIssue } from '../hooks/useJiraIssue';
import JiraCommentsModal from './JiraCommentsModal';
import JiraDescriptionModal from './JiraDescriptionModal';
import {
 Users,
 UsersRound,
 Clock,
 LoaderPinwheel,
 Bug,
 Tag,
 Ambulance,
 MessageCircleMore
} from 'lucide-react';

interface JiraStatusProps {
 issueKey: string;
 onJiraData?: (data: JiraIssue) => void;
}

export default function JiraStatus({ issueKey, onJiraData }: JiraStatusProps) {
 const { data, loading, error } = useJiraIssue(issueKey);
 const [showComments, setShowComments] = useState(false);
 const [showDescription, setShowDescription] = useState(false);

 // ✅ Corrección #1: Usa useEffect para notificar al padre
 useEffect(() => {
  if (data && onJiraData) {
   onJiraData(data);
  }
 }, [data, onJiraData]);

 if (loading) {
  return (
   <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
    <LoaderPinwheel size={20} className="text-blue-500 animate-spin" />
    Cargando Jira...
   </span>
  );
 }

 if (error) {
  return <span className="text-red-500 dark:text-red-400">⚠️ Error al cargar Jira</span>;
 }

 if (!data) return null;

 // ✅ Corrección #2: Extraer texto de description
 const getDescriptionText = (desc: any): string => {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  if (typeof desc === 'object' && desc.content) {
   // Formato Jira: doc con bloques de texto
   return desc.content
    .map((block: any) => {
     if (block.type === 'paragraph' && Array.isArray(block.content)) {
      return block.content
       .map((text: any) => text.text || '')
       .join('');
     }
     return '';
    })
    .join('\n')
    .trim();
  }
  return JSON.stringify(desc);
 };

 const descriptionText = getDescriptionText(data.description);

 const statusColor = getJiraStatusColor(data.status);
 return (
  <div className="flex flex-wrap items-center gap-2 bg-gray-600 p-2 rounded-lg">
   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
    {data.status}
   </span>

   {data.priority && (
    <span className="flex items-center gap-1 text-gray-200 text-sm">
     <Ambulance size={16} className="text-blue-300" />
     <span>Prioridad:</span>
     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getJiraStatusColor('abierto')}`}>
      {data.priority}
     </span>
    </span>
   )}

   {data.reporter && (
    <span className="flex items-center gap-1 text-gray-200 text-sm">
     <UsersRound size={16} className="text-blue-300" />
     <span>Creado por:</span> {data.reporter}
    </span>
   )}

   {data.assignee && (
    <span className="flex items-center gap-1 text-gray-200 text-sm">
     <Users size={16} className="text-blue-300" />
     <span>Asignado a:</span> {data.assignee}
    </span>
   )}

   <span className="flex items-center gap-1 text-gray-200 text-sm">
    <Clock size={16} className="text-blue-300" />
    <span>Actualizado:</span> {new Date(data.updated).toLocaleDateString('es-ES')}
   </span>

   {data.issueType && (
    <span className="flex items-center gap-1 text-gray-200 text-sm">
     <Bug size={16} className="text-blue-300" />
     <span>Tipo:</span>
     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getJiraStatusColor('abierto')}`}>
      {data.issueType}
     </span>
    </span>
   )}

   {data.description && (
    <button
     onClick={() => setShowDescription(true)}
     className="flex items-center gap-1 text-blue-300 hover:text-blue-100 text-sm font-medium"
     title="Ver descripción"
    >
     <MessageCircleMore size={16} />
     Descripción
    </button>
   )}

   {showDescription && (
    <JiraDescriptionModal
     description={descriptionText}
     onClose={() => setShowDescription(false)}
    />
   )}

   {data.comments && data.comments > 0 && (
    <button
     onClick={() => setShowComments(true)}
     className="flex items-center gap-1 text-blue-300 hover:text-blue-100 text-sm font-medium"
     title="Ver comentarios"
    >
     <MessageCircleMore size={16} />
     Comentarios: {data.comments}
    </button>
   )}

   {showComments && (
    <JiraCommentsModal
     comments={data.commentList || []}
     onClose={() => setShowComments(false)}
    />
   )}
  </div>
 );
}

const getJiraStatusColor = (status: string) => {
 const normalized = status.toLowerCase();
 if (normalized.includes('finalizada') || normalized.includes('done') || normalized.includes('cerrada')) {
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700';
 }
 if (normalized.includes('en curso') || normalized.includes('in progress') || normalized.includes('dev')) {
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
 }
 if (normalized.includes('qa') || normalized.includes('prueba')) {
  return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300 dark:border-purple-700';
 }
 if (normalized.includes('blocked') || normalized.includes('bloqueada')) {
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700';
 }
 if (normalized.includes('abierto') || normalized.includes('open') || normalized.includes('to do')) {
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700';
 }
 return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
};