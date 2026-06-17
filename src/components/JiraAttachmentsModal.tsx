import React, { useState } from 'react';
import { X, Paperclip, Download, FileText, Image, File, Eye } from 'lucide-react';
import { JiraAttachment } from '../hooks/useJiraIssue';

interface JiraAttachmentsModalProps {
  attachments: JiraAttachment[];
  onClose: () => void;
}

export default function JiraAttachmentsModal({ attachments, onClose }: JiraAttachmentsModalProps) {
  // Estado para controlar el archivo que se está previsualizando
  const [previewFile, setPreviewFile] = useState<JiraAttachment | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  // Determinar si el navegador puede renderizar el archivo directamente
  const isPreviewable = (mimeType: string) => {
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('text/') ||
      mimeType === 'application/json'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col transition-all duration-300 ${previewFile ? 'max-w-6xl h-[90vh]' : 'max-w-3xl max-h-[80vh]'}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {previewFile && (
              <button
                onClick={() => setPreviewFile(null)}
                className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
              >
                ← Volver
              </button>
            )}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Paperclip size={20} className="text-amber-500" />
              {previewFile ? `Vista previa: ${previewFile.filename}` : `Archivos Adjuntos (${attachments.length})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* LISTA DE ADJUNTOS (Se oculta o se estrecha si hay preview según prefieras, aquí la mantenemos condicional) */}
          {!previewFile ? (
            <div className="p-6 overflow-y-auto w-full space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                >
                  <div className="flex-shrink-0">{getFileIcon(attachment.mimeType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attachment.filename}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{attachment.author?.toString() || 'Anónimo'}</span>
                      <span>•</span>
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>•</span>
                      <span>{new Date(attachment.created).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* BOTÓN DE VISUALIZAR */}
                    {isPreviewable(attachment.mimeType) && (
                      <button
                        onClick={() => setPreviewFile(attachment)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                    )}

                    {/* BOTÓN DE DESCARGA */}
                    <a
                      href={attachment.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Descargar"
                    >
                      <Download size={18} className="text-gray-600 dark:text-gray-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ÁREA DE PREVISUALIZACIÓN */
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col">
              <div className="bg-white dark:bg-gray-800 rounded shadow-inner overflow-auto flex-1 flex items-center justify-center">
                {previewFile.mimeType.startsWith('image/') ? (
                  <img
                    src={previewFile.content}
                    alt={previewFile.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={previewFile.content}
                    title={previewFile.filename}
                    className="w-full h-full border-none"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}