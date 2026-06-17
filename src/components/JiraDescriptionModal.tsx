// src/components/JiraDescriptionModal.tsx
import React from 'react';
import { X, ExternalLink, User } from 'lucide-react';
import { JiraAttachment } from '../hooks/useJiraIssue';

// --- TIPOS ADF (Atlassian Document Format) ---
interface JiraText { type: 'text'; text: string; marks?: JiraMark[]; }
interface JiraMark { type: 'strong' | 'em' | 'underline' | 'strike' | 'link' | 'code'; attrs?: { href?: string }; }
interface JiraParagraph { type: 'paragraph'; content?: JiraNode[]; }
interface JiraHeading { type: 'heading'; attrs?: { level?: number }; content?: JiraNode[]; }
interface JiraMedia { type: 'media'; attrs: { id: string; alt?: string; }; }
interface JiraMediaSingle { type: 'mediaSingle'; content?: JiraMedia[]; }
interface JiraListItem { type: 'listItem'; content?: JiraNode[]; }
interface JiraList { type: 'orderedList' | 'bulletList'; content?: JiraListItem[]; }
interface JiraCodeBlock { type: 'codeBlock'; content?: { type: 'text'; text: string }[]; }
interface JiraBlockquote { type: 'blockquote'; content?: JiraNode[]; }
interface JiraTable { type: 'table'; content?: { type: 'tableRow'; content: { type: 'tableCell' | 'tableHeader'; content: JiraNode[] }[] }[]; }
interface JiraMention { type: 'mention'; attrs: { text: string }; }
interface JiraStatus { type: 'status'; attrs: { text: string; color: string }; }

type JiraNode = JiraText | JiraParagraph | JiraHeading | JiraMediaSingle | JiraList | JiraCodeBlock | JiraBlockquote | JiraTable | JiraMention | JiraStatus | { type: 'rule' | 'hardBreak' | 'inlineCard'; attrs?: any };

interface JiraDescriptionModalProps {
  description: any;
  attachments?: JiraAttachment[]; // Opcional: para cruzar IDs de media con URLs reales
  onClose: () => void;
}

// ✅ Función de renderizado recursivo para ADF
const renderNode = (node: any, index: number): React.ReactNode => {
  if (!node || !node.type) return null;

  switch (node.type) {
    case 'text':
      let element = <>{node.text || ''}</>;
      node.marks?.forEach((mark: JiraMark) => {
        if (mark.type === 'strong') element = <strong className="font-bold text-gray-900 dark:text-white">{element}</strong>;
        if (mark.type === 'em') element = <em className="italic">{element}</em>;
        if (mark.type === 'underline') element = <u className="underline">{element}</u>;
        if (mark.type === 'strike') element = <del className="line-through text-gray-400">{element}</del>;
        if (mark.type === 'code') element = <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400 font-mono text-xs">{element}</code>;
        if (mark.type === 'link') element = <a href={mark.attrs?.href} target="_blank" rel="noopener" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">{element}<ExternalLink size={10} /></a>;
      });
      return <React.Fragment key={index}>{element}</React.Fragment>;

    case 'paragraph':
      return <p key={index} className="mb-4 leading-relaxed">{node.content?.map((child: any, i: number) => renderNode(child, i))}</p>;

    case 'heading':
      const Level = `h${node.attrs?.level || 2}` as keyof JSX.IntrinsicElements;
      const sizes: any = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg', h4: 'text-base' };
      return <Level key={index} className={`${sizes[Level] || 'text-lg'} font-bold text-gray-900 dark:text-white mt-6 mb-3 border-b border-gray-100 dark:border-gray-800 pb-1`}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</Level>;

    case 'bulletList':
      return <ul key={index} className="list-disc list-outside mb-4 ml-6 space-y-1 text-gray-700 dark:text-gray-300">{node.content?.map((item: any, i: number) => <li key={i}>{item.content?.map((c: any, j: number) => renderNode(c, j))}</li>)}</ul>;

    case 'orderedList':
      return <ol key={index} className="list-decimal list-outside mb-4 ml-6 space-y-1 text-gray-700 dark:text-gray-300">{node.content?.map((item: any, i: number) => <li key={i}>{item.content?.map((c: any, j: number) => renderNode(c, j))}</li>)}</ol>;

    case 'codeBlock':
      return <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-xs border border-gray-800 shadow-inner"><code>{node.content?.map((c: any) => c.text).join('')}</code></pre>;

    case 'blockquote':
      return <blockquote key={index} className="border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 pl-4 py-2 italic my-4 text-gray-600 dark:text-gray-400">{node.content?.map((c: any, i: number) => renderNode(c, i))}</blockquote>;

    case 'table':
      return (
        <div key={index} className="overflow-x-auto my-6 border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/20">
              {node.content?.map((row: any, i: number) => (
                <tr key={i}>
                  {row.content?.map((cell: any, j: number) => (
                    <td key={j} className={`p-3 text-sm border-r border-gray-100 dark:border-gray-800 last:border-0 ${cell.type === 'tableHeader' ? 'bg-gray-50 dark:bg-gray-800 font-bold' : ''}`}>
                      {cell.content?.map((c: any, k: number) => renderNode(c, k))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'mention':
      return <span key={index} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium text-xs"><User size={12} />{node.attrs.text}</span>;

    case 'status':
      const colors: any = { green: 'bg-emerald-100 text-emerald-800', red: 'bg-red-100 text-red-800', blue: 'bg-blue-100 text-blue-800', yellow: 'bg-amber-100 text-amber-800' };
      return <span key={index} className={`inline-block px-2 py-0.5 rounded uppercase text-[10px] font-bold tracking-wider border border-current/20 ${colors[node.attrs.color] || 'bg-gray-100 text-gray-800'}`}>{node.attrs.text}</span>;

    case 'mediaSingle':
      const media = node.content?.[0];
      if (media?.attrs?.id) {
        return (
          <div key={index} className="my-6 group relative">
            <img
              src={`http://localhost:4000/jira/image/${media.attrs.id}`}
              alt={media.attrs.alt || 'Jira attachment'}
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-auto"
              onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
            />
          </div>
        );
      }
      return null;

    case 'rule': return <hr key={index} className="my-6 border-t border-gray-200 dark:border-gray-700" />;
    case 'hardBreak': return <br key={index} />;
    default: return null;
  }
};

export default function JiraDescriptionModal({ description, onClose }: JiraDescriptionModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Header con estilo Jira */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Descripción</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {description && typeof description === 'object' && description.type === 'doc' ? (
            <article className="prose prose-slate dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {description.content?.map((node: any, index: number) => renderNode(node, index))}
            </article>
          ) : typeof description === 'string' ? (
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {description}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
              <p>No hay contenido adicional para mostrar en este ticket.</p>
            </div>
          )}
        </div>

        {/* Footer opcional para cerrar */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}