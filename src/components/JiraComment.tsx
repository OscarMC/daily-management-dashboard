// src/components/JiraComment.tsx
import React, { useState } from 'react';
import { JiraAttachment } from '../hooks/useJiraIssue';
import { X, ZoomIn, ArrowLeft } from 'lucide-react';

interface JiraCommentProps {
  comment: any;
  allAttachments?: JiraAttachment[];
}

export default function JiraComment({ comment, allAttachments }: JiraCommentProps) {
  const { author, created, body } = comment;
  // Estado para la imagen o archivo ampliado
  const [expandedMedia, setExpandedMedia] = useState<JiraAttachment | null>(null);

  const renderContent = (contentObj: any): React.ReactNode => {
    if (!contentObj || !contentObj.content) return null;

    return contentObj.content.map((node: any, idx: number) => {
      if (node.type === 'paragraph') {
        return <p key={idx} className="mb-2">{renderContent(node)}</p>;
      }

      if (node.type === 'text') {
        let text: React.ReactNode = node.text;
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === 'strong') text = <strong key={idx}>{text}</strong>;
            if (mark.type === 'em') text = <em key={idx}>{text}</em>;
          });
        }
        return text;
      }

      if (node.type === 'media' || node.type === 'mediaSingle') {
        const mediaNode = node.type === 'mediaSingle' ? node.content[0] : node;
        // Jira a veces usa 'alt' o 'id' para el nombre del archivo en el ADF
        const fileName = mediaNode.attrs?.alt || mediaNode.attrs?.id;

        const attachment = allAttachments?.find(a => a.filename === fileName || a.id === fileName);

        if (attachment && attachment.mimeType.startsWith('image/')) {
          return (
            <div key={idx} className="group relative my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 inline-block cursor-zoom-in"
              onClick={() => setExpandedMedia(attachment)}>
              <img
                src={attachment.content}
                alt={attachment.filename}
                className="max-w-full h-auto block transition-opacity group-hover:opacity-90"
                style={{ maxHeight: '200px' }}
              />
              {/* Overlay de ayuda visual */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <ZoomIn className="text-white drop-shadow-md" size={32} />
              </div>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 block">
                {attachment.filename} (Click para ampliar)
              </span>
            </div>
          );
        }

        return (
          <div key={idx} className="flex items-center gap-2 p-2 my-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-300">
            <span className="text-xs italic text-gray-500">[Archivo adjunto: {attachment?.filename || 'No disponible'}]</span>
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="flex gap-3 relative">
      {/* MODAL DE AMPLIACIÓN (Solo se ve si hay media seleccionado) */}
      {expandedMedia && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 left-4 flex gap-4">
            <button
              onClick={() => setExpandedMedia(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-colors"
            >
              <ArrowLeft size={20} /> Volver al comentario
            </button>
          </div>

          <button
            onClick={() => setExpandedMedia(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          <img
            src={expandedMedia.content}
            alt={expandedMedia.filename}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
          />

          <p className="mt-4 text-white font-medium bg-black/50 px-4 py-2 rounded-full">
            {expandedMedia.filename}
          </p>
        </div>
      )}

      {/* Renderizado Normal del Comentario */}
      <img
        src={author?.avatarUrls?.['48x48']}
        alt={author?.displayName}
        className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {author?.displayName}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(created).toLocaleString('es-ES')}
          </span>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {typeof body === 'string' ? body : renderContent(body)}
        </div>
      </div>
    </div>
  );
}