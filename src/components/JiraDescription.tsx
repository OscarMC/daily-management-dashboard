// src/components/JiraDescription.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';

interface JiraDescriptionProps {
  description: {
    author?: { displayName?: string; avatarUrls?: { '48x48'?: string } };
    created: string;
    body: any; // Cambiado a any para manejar el objeto 'doc' de Jira
  };
}

export default function JiraDescription({ description }: JiraDescriptionProps) {
  const authorName = description.author?.displayName || 'Usuario desconocido';
  const avatarUrl = description.author?.avatarUrls?.['48x48'] || null;
  const createdAt = description.created ? format(new Date(description.created), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Fecha desconocida';

  // Función para renderizar el contenido enriquecido (ADF)
  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-2 min-h-[1em]">
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </p>
        );

      case 'text':
        let textElement: React.ReactNode = node.text;
        // Aplicar marcas (bold, italic, code, etc.)
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === 'strong') textElement = <strong key={index} className="font-bold">{textElement}</strong>;
            if (mark.type === 'em') textElement = <em key={index} className="italic">{textElement}</em>;
            if (mark.type === 'code') textElement = <code key={index} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs font-mono">{textElement}</code>;
            if (mark.type === 'underline') textElement = <u key={index}>{textElement}</u>;
            if (mark.type === 'link') textElement = (
              <a key={index} href={mark.attrs.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {textElement}
              </a>
            );
          });
        }
        return textElement;

      case 'bulletList':
        return (
          <ul key={index} className="list-disc ml-6 mb-3 space-y-1">
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal ml-6 mb-3 space-y-1">
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </ol>
        );

      case 'listItem':
        return <li key={index}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</li>;

      case 'codeBlock':
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-3 rounded-md my-3 overflow-x-auto font-mono text-xs">
            <code>{node.content?.map((child: any) => child.text).join('')}</code>
          </pre>
        );

      case 'heading':
        const Level = `h${node.attrs?.level || 3}` as keyof JSX.IntrinsicElements;
        const headingSizes: Record<string, string> = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg', h4: 'text-base' };
        return (
          <Level key={index} className={`${headingSizes[Level as string]} font-bold mb-2 mt-4 text-gray-900 dark:text-white`}>
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </Level>
        );

      case 'mention':
        return (
          <span key={index} className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1 rounded font-medium">
            @{node.attrs?.text || 'usuario'}
          </span>
        );

      case 'rule':
        return <hr key={index} className="my-4 border-gray-300 dark:border-gray-600" />;

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (typeof description.body === 'string') {
      return <div className="whitespace-pre-wrap">{description.body}</div>;
    }

    if (description.body?.type === 'doc') {
      return <div>{description.body.content?.map((block: any, i: number) => renderNode(block, i))}</div>;
    }

    return <p className="italic text-gray-400">Sin descripción detallada.</p>;
  };

  return (
    <div className="p-4 border-l-4 border-blue-500 bg-white dark:bg-gray-800/40 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={authorName}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">{authorName}</h4>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              <span>{createdAt}</span>
            </div>
          </div>

          <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed prose dark:prose-invert max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}