import React, { useState } from 'react';
import { JiraIssue, JiraToFixVersion, JiraFixVersion } from '../hooks/useJiraIssue';
import JiraCommentsModal from './JiraCommentsModal';
import JiraDescriptionModal from './JiraDescriptionModal';
import JiraLinksModal from './JiraLinksModal';
import JiraAttachmentsModal from './JiraAttachmentsModal';
import JiraSubtasksModal from './JiraSubtasksModal';
import {
  Users, UsersRound, Clock, MessageCircleMore,
  Tag, Layers, Calendar, ExternalLink, Milestone,
  Paperclip, Link2, CheckSquare, FileText, Timer,
  ChevronDown, ChevronUp, CircleDot, AlertCircle,
  FolderKanban, CheckCircle2, ListTree, Zap, Info
} from 'lucide-react';

interface JiraStatusExtendedProps {
  issue: JiraIssue;
}

export default function JiraStatusExtended({ issue }: JiraStatusExtendedProps) {
  const [showComments, setShowComments] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const attachmentsCount = issue.attachmentList?.length || 0;
  const linksCount = issue.issuelinks?.length || 0;
  const commentsCount = issue.commentList?.length || 0;
  const subtasksCount = issue.subtasks?.length || 0;
  const labels = issue.labels || [];
  const components = issue.components || [];

  const getStatusStyles = (status: string = '') => {
    const s = status.toUpperCase();
    if (['DONE', 'RESOLVED', 'CLOSED', 'COMPLETED'].includes(s)) {
      return {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        bg: 'bg-emerald-50/50 dark:bg-emerald-900/10'
      };
    }
    if (['IN PROGRESS', 'DEVELOPMENT', 'TESTING', 'REVIEW', 'EN CURSO', 'COMMITTED'].includes(s)) {
      return {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        bg: 'bg-blue-50/50 dark:bg-blue-900/10'
      };
    }
    return {
      badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
      bg: 'bg-white dark:bg-gray-800'
    };
  };

  const getPriorityStyles = (priority: string = '') => {
    const p = priority.toLowerCase();
    if (p.includes('high') || p.includes('crit')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    if (p.includes('medium')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800';
  };

  const statusStyle = getStatusStyles(issue.status);

  return (
    <div className={`${statusStyle.bg} border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="p-4">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block text-sm font-mono font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm">
            {issue.key}
          </span>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{issue.summary}</h3>
            {issue.resolution && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <CheckCircle2 size={10} /> Resuelto: {issue.resolution}
              </div>
            )}
          </div>

          <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors p-1">
            <ExternalLink size={18} />
          </a>
        </div>

        {/* ACCIONES RÁPIDAS Y ESTADO */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 rounded text-[11px] font-medium border border-gray-200 dark:border-gray-700 shadow-sm">
            {issue.issuetype?.iconUrl ? <img src={issue.issuetype.iconUrl} alt="" className="w-3.5 h-3.5" /> : <Zap size={13} className="text-gray-400" />}
            <span className="text-gray-700 dark:text-gray-300">{issue.issuetype?.name}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border shadow-sm ${getPriorityStyles(issue.priority)}`}>
            <AlertCircle size={13} /> {issue.priority}
          </div>

          {issue.status && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border uppercase tracking-wider shadow-sm ${statusStyle.badge}`}>
              <CircleDot size={13} /> {issue.status}
            </div>
          )}

          <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block" />

          {/* Botones de acción recuperados */}
          {issue.description && (
            <button onClick={() => setShowDescription(true)} className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-900/80 hover:bg-white text-gray-700 dark:text-gray-300 rounded text-xs border border-gray-200 dark:border-gray-700 transition-colors shadow-sm">
              <FileText size={13} /> Descripción
            </button>
          )}

          {commentsCount > 0 && (
            <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-900/80 hover:bg-white text-purple-700 dark:text-purple-400 rounded text-xs border border-gray-200 dark:border-gray-700 transition-colors shadow-sm">
              <MessageCircleMore size={13} /> {commentsCount}
            </button>
          )}

          {attachmentsCount > 0 && (
            <button onClick={() => setShowAttachments(true)} className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-900/80 hover:bg-white text-amber-700 dark:text-amber-400 rounded text-xs border border-gray-200 dark:border-gray-700 transition-colors shadow-sm">
              <Paperclip size={13} /> {attachmentsCount}
            </button>
          )}

          {linksCount > 0 && (
            <button onClick={() => setShowLinks(true)} className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-900/80 hover:bg-white text-indigo-700 dark:text-indigo-400 rounded text-xs border border-gray-200 dark:border-gray-700 transition-colors shadow-sm">
              <Link2 size={13} /> {linksCount}
            </button>
          )}

          {subtasksCount > 0 && (
            <button onClick={() => setShowSubtasks(true)} className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-900/80 hover:bg-white text-cyan-700 dark:text-cyan-400 rounded text-xs border border-gray-200 dark:border-gray-700 transition-colors shadow-sm">
              <ListTree size={13} /> {subtasksCount}
            </button>
          )}

          <button onClick={() => setIsExpanded(!isExpanded)} className="ml-auto flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 transition-all shadow-sm bg-white dark:bg-gray-900">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {isExpanded ? 'Colapsar' : 'Más detalles'}
          </button>
        </div>

        {/* PANEL EXPANDIBLE */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">

            {/* Personas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  {issue.reporterDetails?.avatarUrls && <img src={issue.reporterDetails.avatarUrls['48x48']} className="w-10 h-10 rounded-full" alt="" />}
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Reporter</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold dark:text-white">{issue.reporter}</span>
                    
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-full">
                  {issue.assigneeDetails?.avatarUrls && <img src={issue.assigneeDetails.avatarUrls['48x48']} className="w-10 h-10 rounded-full" alt="" />}
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Assignee</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold dark:text-white">{issue.assignee || 'Sin asignar'}</span>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex flex-wrap gap-6 px-3 py-2 bg-gray-50/50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Creado:</span><span className="text-xs font-medium dark:text-gray-200">{formatDate(issue.created)}</span></div>
              <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Actualizado:</span><span className="text-xs font-medium dark:text-gray-200">{formatDate(issue.updated)}</span></div>
              {issue.duedate && <div className="flex items-center gap-2 text-red-600"><Calendar size={14} /><span className="text-xs font-bold uppercase">Vencimiento: {formatDate(issue.duedate)}</span></div>}
            </div>

            {/* Versiones (Colores Originales) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                <span className="text-red-700 dark:text-red-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2">
                  <Milestone size={14} /> Affected Versions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {issue.affectedVersions?.length ? issue.affectedVersions.map(v => <span key={v} className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-red-200 text-red-800 dark:text-red-200 text-xs font-mono font-bold">{v}</span>) : <span className="text-gray-400 italic text-[10px]">None</span>}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2">
                  <CheckSquare size={14} /> Fix Versions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {issue.fixVersions?.length ? issue.fixVersions?.map((v: JiraFixVersion | string, i: number) => (
                    <span key={i} className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold">{typeof v === 'string' ? v : <a href={v.self} target="_blank" rel="noopener noreferrer" className="hover:underline">{v.name}</a>}</span>
                  )) : <span className="text-gray-400 italic text-[10px]">None</span>}
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="text-blue-700 dark:text-blue-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2">
                  <Timer size={14} /> To Fix
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {issue.customFields?.tofix?.length ? issue.customFields?.tofix?.map((v: JiraToFixVersion, i: number) => (
                    <span key={i} className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-blue-200 text-blue-800 dark:text-blue-200 text-xs font-mono font-bold"><a href={v.self} target="_blank" rel="noopener noreferrer" className="hover:underline">{v.value}</a></span>
                  )) : <span className="text-gray-400 italic text-[10px]">None</span>}
                </div>
              </div>
            </div>

            {/* Labels y Components (Nueva estructura 1/2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2">
                  <Tag size={14} /> Labels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {labels.length > 0 ? labels.map(label => (
                    <span key={label} className="bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold font-mono">{label}</span>
                  )) : <span className="text-gray-400 italic text-[10px]">Sin etiquetas</span>}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase flex items-center gap-1.5 mb-2">
                  <Layers size={14} /> Components
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {components.length > 0 ? components.map((c: any) => (
                    <span key={c.name} className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-indigo-200 text-indigo-800 dark:text-indigo-200 text-xs font-bold font-mono">{c.name}</span>
                  )) : <span className="text-gray-400 italic text-[10px]">Sin componentes</span>}
                </div>
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="p-4 bg-white/40 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
              <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase mb-3">
                <Info size={14} /> Detalles Técnicos del Sistema
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-8 text-xs">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                  <span className="text-gray-500">Proyecto</span>
                  <span className="font-medium dark:text-gray-300">{issue.project}</span>
                </div>
                {issue.customFields?.resolutiondate && (
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                    <span className="text-gray-500">Fecha de Resolución</span>
                    <span className="font-bold text-emerald-600">{formatDate(issue.customFields.resolutiondate)}</span>
                  </div>
                )}
                {Object.entries(issue).map(([key, value]) => {
                  if (['string', 'number'].includes(typeof value) && !['summary', 'key', 'url', 'description', 'status', 'priority', 'created', 'updated', 'reporter', 'assignee'].includes(key)) {
                    return (
                      <div key={key} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium dark:text-gray-300 text-right">{String(value)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALES */}
      {showLinks && <JiraLinksModal links={issue.issuelinks || []} onClose={() => setShowLinks(false)} />}
      {showDescription && <JiraDescriptionModal description={issue.description} onClose={() => setShowDescription(false)} />}
      {showComments && <JiraCommentsModal comments={issue.commentList || []} attachments={issue.attachmentList || []} onClose={() => setShowComments(false)} />}
      {showAttachments && <JiraAttachmentsModal attachments={issue.attachmentList || []} onClose={() => setShowAttachments(false)} />}
      {showSubtasks && <JiraSubtasksModal subtasks={issue.subtasks || []} onClose={() => setShowSubtasks(false)} />}
    </div>
  );
}