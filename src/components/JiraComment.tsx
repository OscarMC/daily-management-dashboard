// src/components/JiraComment.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface JiraCommentProps {
 comment: {
  author?: { displayName?: string; avatarUrls?: { '48x48'?: string } };
  created: string; // ISO string
  body: string;
 };
}

export default function JiraComment({ comment }: JiraCommentProps) {
 const authorName = comment.author?.displayName || 'Usuario desconocido';
 const avatarUrl = comment.author?.avatarUrls?.['48x48'] || null;
 const createdAt = comment.created ? format(new Date(comment.created), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Fecha desconocida';

 // Intentar extraer texto plano de body (a veces es objeto)
 let bodyText = '';
 try {
  if (typeof comment.body === 'string') {
   bodyText = comment.body;
  } else if (comment.body && typeof comment.body === 'object') {
   // Si es el formato de Jira (objeto tipo 'doc')
   const content = (comment.body as any).content || [];
   bodyText = content
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
  } else {
   bodyText = JSON.stringify(comment.body);
  }
 } catch (e) {
  bodyText = 'Contenido no disponible';
 }

 return (
  <div className="p-3 border-l-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-r">
   <div className="flex items-start gap-3">
    {avatarUrl ? (
     <img
      src={avatarUrl}
      alt={authorName}
      className="w-8 h-8 rounded-full flex-shrink-0"
      onError={(e) => (e.currentTarget.style.display = 'none')}
     />
    ) : (
     <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
       {authorName.charAt(0).toUpperCase()}
      </span>
     </div>
    )}

    <div className="flex-1 min-w-0">
     <div className="flex justify-between items-start">
      <h4 className="font-medium text-gray-800 dark:text-white">{authorName}</h4>
      <span className="text-xs text-gray-500 dark:text-gray-400">{createdAt}</span>
     </div>
     <div
      className="mt-2 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: bodyText.replace(/\n/g, '<br />') }}
     />
    </div>
   </div>
  </div>
 );
}