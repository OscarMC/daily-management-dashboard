// src/hooks/useJiraIssue.ts
import { useState, useEffect } from 'react';

export interface JiraIssue {
 key: string;
 summary: string;
 status: string;
 assignee: string;
 updated: string;
 affectedVersions?: string[];
 fixVersions?: JiraFixVersion[];
 toFix?: JiraToFixVersion[];
 priority?: string;
 issueType?: string;
 created: string;
 description?: JiraDescription;
 labels: string[];
 reporter?: string;
 project?: string; // Nota: En tu JSON es un objeto, mira JiraProject abajo
 resolution?: string | null;
 duedate?: string | null;
 timeestimate?: number | null;
 timespent?: number | null;
 statusCategory?: string;
 statusDescription?: string;
 attachments?: number; // Nota: En tu JSON es un array de objetos, mira JiraAttachment abajo
 comments?: number;
 commentList?: JiraComment[];
 epicLink?: string;
 url: string;
 // Propiedades detectadas en tu JSON de ejemplo:
 self?: string;
 id?: string;
 expand?: string;
 resolutiondate?: string | null;
 votes?: number;
 watches?: number;
 issuetype?: JiraIssueType;
 projectDetails?: JiraProject; // Para mapear el objeto "project" del JSON
 reporterDetails?: JiraUserDetails;
 assigneeDetails?: JiraUserDetails;
 components?: JiraComponent[];
 attachmentList?: JiraAttachment[];
 subtasks?: any[];
 issuelinks?: JiraIssueLink[];
 timetracking?: JiraTimeTracking;
 customFields?: Record<string, any>;
}

export interface JiraToFixVersion
{
 self: string;
 value: string;
 id: string;
}

export interface JiraFixVersion
{
 self: string;
 id: string;
 description: string;
 name: string;
 archived: boolean;
 released: boolean;
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
 content?: JiraNode[];
}

interface JiraList {
 type: 'orderedList' | 'bulletList';
 attrs?: { order?: number };
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
 };
}

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
 | JiraInlineCard
 | JiraToFixVersion
 | JiraComment
 | JiraAttachment;

export interface JiraDescription {
 type: 'doc';
 version: number;
 content: JiraNode[];
}

// ---------------------------------------------------------
// NUEVAS INTERFACES PARA COMPLETAR LA RESPUESTA DE LA API
// ---------------------------------------------------------

export interface JiraAvatarUrls {
 "16x16": string;
 "24x24": string;
 "32x32": string;
 "48x48": string;
}

export interface JiraProject {
 id: string;
 key: string;
 name: string;
 projectTypeKey: string;
 avatarUrls: JiraAvatarUrls;
}

export interface JiraIssueType {
 id: string;
 name: string;
 description: string;
 iconUrl: string;
 subtask: boolean;
 avatarId?: number;
}

export interface JiraUserDetails {
 accountId: string;
 displayName: string;
 emailAddress?: string;
 avatarUrls: JiraAvatarUrls;
 active: boolean;
 timeZone: string;
}

export interface JiraComponent {
 id: string;
 name: string;
 description?: string;
 self?: string;
}

export interface JiraAttachment {
 id: string;
 filename: string;
 author: JiraUserDetails | string; // El JSON de ejemplo trae string, pero la API oficial suele traer el objeto
 created: string;
 size: number;
 mimeType: string;
 content: string; // URL de descarga
 thumbnail?: string;
}

export interface JiraIssueLink {
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

export interface JiraTimeTracking {
 originalEstimate?: string;
 remainingEstimate?: string;
 timeSpent?: string;
 originalEstimateSeconds?: number;
 remainingEstimateSeconds?: number;
 timeSpentSeconds?: number;
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
    console.log(API_BASE);
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