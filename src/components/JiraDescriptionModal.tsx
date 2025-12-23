// src/components/JiraDescriptionModal.tsx
import React from 'react';
import { X } from 'lucide-react';

// Tipos para el Atlassian Document Format (ADF)
interface JiraText {
  type: 'text';
  text: string;
  marks?: JiraMark[];
}

interface JiraMark {
  type: 'strong' | 'em' | 'underline' | 'strike' | 'link' | 'code';
  attrs?: {
    href?: string;
    color?: string;
  };
}

interface JiraParagraph {
  type: 'paragraph';
  content?: JiraNode[];
}

interface JiraHeading {
  type: 'heading';
  attrs?: { level?: number };
  content?: JiraNode[];
}

interface JiraMedia {
  type: 'media';
  attrs: {
    type: 'file' | 'link';
    id?: string;
    url?: string;
    alt?: string;
    collection?: string;
    width?: number;
    height?: number;
  };
}

interface JiraMediaSingle {
  type: 'mediaSingle';
  attrs?: { layout?: string; width?: number; widthType?: string };
  content?: JiraMedia[];
}

interface JiraMediaGroup {
  type: 'mediaGroup';
  content?: JiraMedia[];
}

interface JiraListItem {
  type: 'listItem';
  content?: JiraNode[];
}

interface JiraList {
  type: 'orderedList' | 'bulletList';
  attrs?: { order?: number };
  content?: JiraListItem[];
}

interface JiraCodeBlock {
  type: 'codeBlock';
  attrs?: { language?: string };
  content?: { type: 'text'; text: string }[];
}

interface JiraBlockquote {
  type: 'blockquote';
  content?: JiraNode[];
}

interface JiraTableCell {
  type: 'tableCell' | 'tableHeader';
  attrs?: { colspan?: number; rowspan?: number };
  content?: JiraNode[];
}

interface JiraTableRow {
  type: 'tableRow';
  content?: JiraTableCell[];
}

interface JiraTable {
  type: 'table';
  content?: JiraTableRow[];
}

interface JiraRule {
  type: 'rule';
}

interface JiraInlineCard {
  type: 'inlineCard';
  attrs: {
    url: string;
    title?: string;
  };
}

interface JiraHardBreak {
  type: 'hardBreak';
}

interface JiraMention {
  type: 'mention';
  attrs: { id: string; text: string; accessLevel?: string; localId?: string };
}

interface JiraStatus {
  type: 'status';
  attrs: { text: string; color: string; localId: string; style?: string };
}

// Unión de todos los nodos
type JiraNode =
  | JiraText
  | JiraParagraph
  | JiraHeading
  | JiraMediaSingle
  | JiraMediaGroup
  | JiraList
  | JiraCodeBlock
  | JiraBlockquote
  | JiraTable
  | JiraRule
  | JiraInlineCard
  | JiraHardBreak
  | JiraMention
  | JiraStatus;

interface JiraDescriptionModalProps {
  description: any;
  onClose: () => void;
}

// Componente recursivo para renderizar nodos ADF
const renderNode = (node: JiraNode, index: number): React.ReactNode => {
  if (!node || !node.type) return null;

  // ✅ Texto con marcas
  if (node.type === 'text') {
    let textElement = <>{node.text || ''}</>;
    if (Array.isArray(node.marks)) {
      node.marks.forEach((mark) => {
        if (mark.type === 'strong') textElement = <strong>{textElement}</strong>;
        else if (mark.type === 'em') textElement = <em>{textElement}</em>;
        else if (mark.type === 'underline') textElement = <u>{textElement}</u>;
        else if (mark.type === 'strike') textElement = <del>{textElement}</del>;
        else if (mark.type === 'code') textElement = <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{textElement}</code>;
        else if (mark.type === 'link' && mark.attrs?.href) {
          textElement = (
            <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {textElement}
            </a>
          );
        }
      });
    }
    return <React.Fragment key={index}>{textElement}</React.Fragment>;
  }

  // ✅ Párrafo
  if (node.type === 'paragraph') {
    return (
      <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
        {node.content?.map((child, i) => renderNode(child, i))}
      </p>
    );
  }

  // ✅ Encabezado
  if (node.type === 'heading') {
    const level = node.attrs?.level || 2;
    const Tag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;
    return (
      <Tag key={index} className="font-bold text-gray-800 dark:text-white mt-4 mb-2">
        {node.content?.map((child, i) => renderNode(child, i))}
      </Tag>
    );
  }

  // ✅ Imagen (mediaSingle)
  if (node.type === 'mediaSingle') {
    const media = node.content?.[0];
    if (media?.type === 'media' && media.attrs?.id) {
      const src = `http://localhost:4000/jira/image/${media.attrs.id}`;
      return (
        <div key={index} className="my-3 text-center">
          <img
            src={src}
            alt={media.attrs.alt || 'Jira image'}
            className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      );
    }
    return null;
  }

  // ✅ Grupo de imágenes (mediaGroup)
  if (node.type === 'mediaGroup') {
    return (
      <div key={index} className="my-3 flex flex-wrap justify-center gap-2">
        {node.content?.map((media, i) => {
          if (media.type === 'media' && media.attrs?.id) {
            const src = `http://localhost:4000/jira/image/${media.attrs.id}`;
            return (
              <img
                key={i}
                src={src}
                alt={media.attrs.alt || 'Jira image'}
                className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }

  // ✅ Lista ordenada
  if (node.type === 'orderedList') {
    return (
      <ol key={index} className="list-decimal list-inside mb-3 ml-5 space-y-1">
        {node.content?.map((item, i) => (
          <li key={i} className="text-gray-700 dark:text-gray-300">
            {item.content?.[0]?.type === 'paragraph'
              ? item.content[0].content?.map((child, j) => renderNode(child, j))
              : item.content?.map((child, j) => renderNode(child, j))}
          </li>
        ))}
      </ol>
    );
  }

  // ✅ Lista con viñetas
  if (node.type === 'bulletList') {
    return (
      <ul key={index} className="list-disc list-inside mb-3 ml-5 space-y-1">
        {node.content?.map((item, i) => (
          <li key={i} className="text-gray-700 dark:text-gray-300">
            {item.content?.[0]?.type === 'paragraph'
              ? item.content[0].content?.map((child, j) => renderNode(child, j))
              : item.content?.map((child, j) => renderNode(child, j))}
          </li>
        ))}
      </ul>
    );
  }

  // ✅ Bloque de código
  if (node.type === 'codeBlock') {
    return (
      <pre key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded my-3 overflow-x-auto">
        <code className="text-sm text-gray-800 dark:text-gray-200">
          {node.content?.[0]?.text || ''}
        </code>
      </pre>
    );
  }

  // ✅ Cita
  if (node.type === 'blockquote') {
    return (
      <blockquote key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3 text-gray-700 dark:text-gray-400">
        {node.content?.map((child, i) => renderNode(child, i))}
      </blockquote>
    );
  }

  // ✅ Tabla
  if (node.type === 'table') {
    return (
      <table key={index} className="min-w-full my-3 border-collapse border border-gray-300 dark:border-gray-600">
        <tbody>
          {node.content?.map((row, i) => (
            <tr key={i} className="border border-gray-300 dark:border-gray-600">
              {row.content?.map((cell, j) => (
                <td key={j} className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {cell.content?.map((child, k) => renderNode(child, k))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // ✅ Mención
  if (node.type === 'mention') {
    return (
      <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1 rounded">
        @{node.attrs.text}
      </span>
    );
  }

  // ✅ Status
  if (node.type === 'status') {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    const colorClass = colorMap[node.attrs.color] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    return (
      <span key={index} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {node.attrs.text}
      </span>
    );
  }

  // ✅ Tarjeta inline
  if (node.type === 'inlineCard') {
    return (
      <a
        key={index}
        href={node.attrs.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded text-sm hover:underline"
      >
        {node.attrs.title || node.attrs.url}
      </a>
    );
  }

  // ✅ Regla horizontal
  if (node.type === 'rule') {
    return <hr key={index} className="my-3 border-t border-gray-300 dark:border-gray-600" />;
  }

  // ✅ Salto de línea
  if (node.type === 'hardBreak') {
    return <br key={index} />;
  }

  // ✅ Nodo desconocido
  console.warn(' Nodo ADF no soportado:', node.type);
  return null;
};

export default function JiraDescriptionModal({ description, onClose }: JiraDescriptionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Descripción del ticket</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {description && typeof description === 'object' && description.type === 'doc' ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {description.content?.map((node: JiraNode, index: number) => renderNode(node, index))}
            </div>
          ) : typeof description === 'string' ? (
            <div
              className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Sin descripción disponible.</p>
          )}
        </div>
      </div>
    </div>
  );
}