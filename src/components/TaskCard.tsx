// src/components/TaskCard.tsx
import { useState } from 'react';
import { useRepositories } from '../db/repositoriesStore';
import { usePullRequests } from '../hooks/usePullRequests';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  ClipboardCopy,
  ExternalLink,
  Mail,
  Link,
  Hammer,
  Clock,
  GitBranch,
  Pencil,
} from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from './common/ToastStack';
import PrStatusBadge from './PrStatusBadge';
import JiraStatus from './JiraStatus';
import { db } from '../db/dexieDB';

interface TaskCardProps {
  task: any;
  isPreviousDay?: boolean;
  onMessageOpen: (jiraUrl: string | null, branchUrl: string | null, mergeIn?: string) => void;
  onEdit: (id: number) => void;
}

export default function TaskCard({ task, isPreviousDay = false, onMessageOpen, onEdit }: TaskCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prs } = usePullRequests();
  const { repositories } = useRepositories();

  const [copiedTask, setCopiedTask] = useState<number | null>(null);
  const [jiraSummary, setJiraSummary] = useState<string | null>(null);

  const JIRA_BASE = 'https://winsytemsintl.atlassian.net/browse/';
  const extractJiraKey = (name: string): string | null => {
    const match = name.match(/^(WIGOS-\d{4,6})/i);
    return match ? match[1] : null;
  };

  const jiraKey = extractJiraKey(task.name);
  const jiraUrl = jiraKey ? `${JIRA_BASE}${jiraKey}` : null;
  const repo = repositories.find((r) => r.id === Number(task.repositoryId));
  const repoName = repo?.name;

  const branchUrl = task.branch
    ? `https://bitbucket.org/wigos-dev/${repoName || 'repo'}/branch/${task.branch}`
    : repoName
      ? `https://bitbucket.org/wigos-dev/${repoName}/branches`
      : null;

  const mergeInUrl = task.mergeIn
    ? `https://bitbucket.org/wigos-dev/${repoName || 'repo'}/branch/${task.mergeIn}`
    : repoName
      ? `https://bitbucket.org/wigos-dev/${repoName}/branches`
      : null;

  const associatedPr = prs.find(
    (pr) =>
      String(pr.taskId) === String(task.id) ||
      (typeof pr.taskId === 'string' && pr.taskId.includes(String(task.id)))
  );

  const copyText = async (text: string, id: number, type: 'task' | 'branch' | 'itemId') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'task') {
        setCopiedTask(id);
        setTimeout(() => setCopiedTask(null), 2000);
      }
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  const copyBranchName = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTask(id);
      toast({ message: '📋 Nombre copiado', type: 'success' });
      setTimeout(() => setCopiedTask(null), 2000);
    } catch {
      toast({ message: '⚠️ Error al copiar.', type: 'warn' });
    }
  };

  const toggleTaskCompleted = async (taskId: number, currentStatus: boolean) => {
    if (!user) return;
    const task = await db.tasks.get(taskId);
    if (!task || task.userId !== user.id) return;
    try {
      await db.tasks.update(taskId, { completed: !currentStatus });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const isVacation = task.type === 'VACACIONES';
  const isOther = task.type === 'OTROS';
  const displayTitle = jiraSummary || task.name;

  return (
    <div
      className={`p-3 rounded-lg w-[1650px] border relative ${isVacation
        ? 'border-teal-400 bg-teal-100 dark:border-teal-600/30 dark:bg-teal-900/40'
        : task.completed
          ? 'border-green-400 bg-green-50 dark:border-green-600/30 dark:bg-green-900/30'
          : isOther
            ? 'border-amber-500 bg-slate-100 dark:border-amber-600/30 dark:bg-amber-950'
            : isPreviousDay
              ? 'border-blue-300 bg-blue-50/30 dark:border-blue-600/30 dark:bg-blue-900/30'
              : 'border-orange-300 bg-yellow-50 dark:border-orange-600/30 dark:bg-yellow-900/30'
        }`}
    >
      <div className="flex items-start justify-between gap-4 w-full">
        {/* Contenido principal (ícono + título + Jira + ramas + descripción) */}
        <div className="flex min-w-0 flex-1 gap-x-2">
          <span className="mt-1 size-15 flex-none inline-flex items-center rounded-full bg-green-400/10 p-2">
            {task.completed ? (
              <CheckCircle size={30} className="text-green-500 ml-1" />
            ) : (
              <Hammer size={30} className="text-yellow-500 ml-1" />
            )}
          </span>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <p className="text-lg font-semibold text-gray-400 truncate line-clamp-3">
              {isVacation
                ? 'VACACIONES - Día libre'
                : isOther
                  ? `OTROS - ${task.name}`
                  : jiraKey
                    ? `${jiraKey} - ${displayTitle}`
                    : task.name}
            </p>

            {jiraKey && !isVacation && !isOther && (
              <JiraStatus
                issueKey={jiraKey}
                onJiraData={(data) => setJiraSummary(data.summary)}
              />
            )}

            {/* Bloque de ramas con estilo de DailyTasks */}
            {!isVacation && task.mergeIn && (
              <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                <div className="mb-2">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/40 px-2 py-0.5 rounded">
                    Bitbucket info
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <GitBranch size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-md text-blue-700 dark:text-blue-300 font-mono truncate">
                    {repoName} {"-->"} {task.mergeIn}
                  </p>
                  {associatedPr && (
                    <button
                      onClick={() => navigate('/prs')}
                      className="cursor-pointer"
                      title={`Ver PR: ${associatedPr.title}`}
                    >
                      <PrStatusBadge status={associatedPr.status} />
                    </button>
                  )}
                  <button
                    onClick={() => copyBranchName(task.mergeIn || '', task.id!)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                    title="Copiar rama de merge"
                  >
                    <ClipboardCopy
                      size={16}
                      className={copiedTask === task.id ? 'text-green-500' : 'text-gray-400'}
                    />
                  </button>
                  {mergeInUrl && (
                    <a
                      href={mergeInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Abrir rama de merge en Bitbucket"
                    >
                      <ExternalLink size={16} className="text-blue-500 hover:text-blue-400" />
                    </a>
                  )}
                </div>

                {task.branch && (
                  <div className="flex items-center gap-2 mt-2 pl-5">
                    <GitBranch size={12} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
                      ← {task.branch}
                    </p>
                    <button
                      onClick={() => copyBranchName(task.branch || '', task.id!)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Copiar rama de desarrollo"
                    >
                      <ClipboardCopy
                        size={16}
                        className={copiedTask === task.id ? 'text-green-500' : 'text-gray-400'}
                      />
                    </button>
                    {branchUrl && (
                      <a
                        href={branchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                        title="Abrir rama de desarrollo en Bitbucket"
                      >
                        <ExternalLink size={16} className="text-blue-500 hover:text-blue-400" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Descripción con estilo de DailyTasks */}
            {task.description && (
              <div className="mt-2 p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600">
                <div className="mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    Task description
                  </span>
                </div>
                <p
                  className="text-sm text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: acciones, switch, horas, usuario */}
        <div className="flex flex-col items-end gap-2 min-w-fit">
          <div className="grid grid-cols-3 gap-px">
            <Button
              variant="default"
              size="md"
              onClick={() => copyText(task.name, task.id!, 'task')}
              title="Copiar nombre"
            >
              <ClipboardCopy size={14} />
              Desc
            </Button>

            {task.itemId && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => copyText(task.itemId, task.id!, 'itemId')}
                title="Copiar ID de tarea"
              >
                <Link size={14} />
                Id
              </Button>
            )}

            {jiraUrl && (
              <Button variant="ghost" size="md" title="Abrir en Jira">
                <a href={jiraUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink size={14} className="mr-1" />
                  Jira
                </a>
              </Button>
            )}

            {branchUrl && (
              <Button variant="success" size="md" title="Abrir en Bitbucket">
                <a href={branchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink size={14} className="mr-1" />
                  BitBucket
                </a>
              </Button>
            )}

            <Button
              variant="danger"
              size="md"
              onClick={() => onMessageOpen(jiraUrl, branchUrl, task.mergeIn)}
              title="Generar mensaje PR"
            >
              <Mail size={14} />
              Teams
            </Button>

            <Button
              variant="warning"
              size="md"
              onClick={() => onEdit(task.id!)}
              className="text-yellow-400"
              title="Editar tarea"
            >
              <Pencil size={14} />
              Edit
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => toggleTaskCompleted(task.id!, task.completed)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${task.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              aria-pressed={task.completed}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${task.completed ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
            <span className={`text-sm font-medium ${task.completed
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {task.completed ? 'Completada' : 'En curso'}
            </span>

            <div
              className={`text-xl font-bold font-mono px-3 py-1 rounded-md shadow-sm ${task.completed
                ? 'text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300'
                : 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300'
                }`}
            >
              <Clock size={18} className="inline mr-1.5 mb-0.5" />
              {task.hours.toFixed(2)} h
            </div>
          </div>

          <div className="relative bottom-1 top-1 right-1">
            <span className="px-1 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
              {user?.name || 'Usuario'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}