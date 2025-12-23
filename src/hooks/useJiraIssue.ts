// src/hooks/useJiraIssue.ts
import { useState, useEffect } from 'react';

export interface JiraIssue {
 // ✅ Campos existentes (mantenidos)
 key: string;
 summary: string;
 status: string;
 assignee: string;
 updated: string; // ISO string

 // 👇 Nuevos campos útiles (todos opcionales)
 priority?: string;
 issueType?: string;
 created: string;
 description?: JiraDescription; // Puede ser string u objeto 'doc'
 labels: string[];
 reporter?: string;
 project?: string;
 resolution?: string | null;
 duedate?: string | null;
 timeestimate?: number | null;
 timespent?: number | null;
 statusCategory?: string;
 statusDescription?: string;
 attachments?: number;
 comments?: number;
 commentList?: JiraComment[];
 epicLink?: string;
 url: string; // Enlace directo en Jira
}

export interface JiraComment {
 self: string;
 id: string;
 author: any;
 body: any;
 updateAuthor: any[];
 created: string;
 updated: string;
 jsdPublic: boolean;
}

// Tipos para el cuerpo de texto con marcas
interface JiraText {
 type: 'text';
 text: string;
 marks?: JiraMark[];
}

interface JiraMark {
 type: 'strong' | 'em' | 'underline' | 'strike' | 'link' | 'code' | 'subsup';
 attrs?: {
  href?: string;          // para 'link'
  name?: string;          // para 'mention'
  color?: string;         // para 'textColor'
  // ... otros atributos según el tipo
 };
}

// Tipos de bloque
interface JiraParagraph {
 type: 'paragraph';
 content?: JiraNode[];
}

interface JiraHeading {
 type: 'heading';
 attrs: { level: number };
 content?: JiraNode[];
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

// Listas
interface JiraListItem {
 type: 'listItem';
 content?: JiraNode[]; // usualmente contiene un 'paragraph'
}

interface JiraList {
 type: 'orderedList' | 'bulletList';
 attrs?: { order?: number }; // solo orderedList
 content?: JiraListItem[];
}

// Tablas
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

// Imágenes y medios
interface JiraMedia {
 type: 'media';
 attrs: {
  type: 'file' | 'link';
  id?: string;        // fileId (UUID)
  url?: string;       // URL directa (menos común en attachments)
  alt?: string;
  collection?: string;
  width?: number;
  height?: number;
 };
}

interface JiraMediaSingle {
 type: 'mediaSingle';
 attrs: {
  layout?: 'center' | 'align-start' | 'align-end';
  width?: number;
  widthType?: 'pixel' | 'percentage';
 };
 content?: JiraMedia[];
}

interface JiraMediaGroup {
 type: 'mediaGroup';
 content?: JiraMedia[];
}

// Otros
interface JiraRule {
 type: 'rule';
}

interface JiraHardBreak {
 type: 'hardBreak';
}

interface JiraMention {
 type: 'mention';
 attrs: {
  id: string;
  text: string;
  accessLevel?: string;
  localId?: string;
 };
}

interface JiraStatus {
 type: 'status';
 attrs: {
  text: string;
  color: string;
  localId: string;
  style?: string;
 };
}

interface JiraInlineCard {
 type: 'inlineCard';
 attrs: {
  url: string;
  // Jira puede incluir más attrs en contextos específicos
 };
}

// Unión de todos los nodos posibles
type JiraNode =
 | JiraText
 | JiraParagraph
 | JiraHeading
 | JiraCodeBlock
 | JiraBlockquote
 | JiraList
 | JiraTable
 | JiraMediaSingle
 | JiraMediaGroup
 | JiraRule
 | JiraHardBreak
 | JiraMention
 | JiraStatus
 | JiraInlineCard;

// Documento raíz
export interface JiraDescription {
 type: 'doc';
 version: number; // usualmente 1
 content: JiraNode[];
}

const API_BASE = import.meta.env.VITE_JIRA_API_BASE_URL || 'http://localhost:4000';

export const useJiraIssue = (issueKey: string | null) => {
 const [data, setData] = useState<JiraIssue | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  if (!issueKey) {
   setData(null);
   setError(null);
   return;
  }

  const fetchIssue = async () => {
   setLoading(true);
   setError(null);
   try {
    const res = await fetch(`${API_BASE}/jira/${issueKey}`);
    
    if (!res.ok) {
     const text = await res.text();
     throw new Error(`HTTP ${res.status}: ${text}`);
    }

    // ✅ Solo una vez: leer el JSON
    const json = await res.json();
    console.log('Json recibido:', json);

    setData(json as JiraIssue);
   } catch (err: any) {
    console.error('Error fetching Jira issue:', err);
    setError('⚠️ No se pudo cargar el estado de Jira');
   } finally {
    setLoading(false);
   }
  };

  fetchIssue();
 }, [issueKey]);

 return { data, loading, error };
};