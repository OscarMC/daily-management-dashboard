import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'
import WidgetCard from '../components/common/WidgetCard'
import ProgressBar from '../components/common/ProgressBar'
import { useTranslation } from 'react-i18next'
import { useRepositories } from '../db/repositoriesStore'
import {
  CheckCircle,
  ClipboardCopy,
  ExternalLink,
  Mail,
  Link,
  Hammer,
  Clock,
  Calculator,
  CalendarDays,
  GitBranch,
  Pencil,
} from 'lucide-react'
import { useState } from 'react'
import EditTaskModal from '../components/common/EditTaskModal'
import { Button } from '../components/ui/Button'
import { toast } from '../components/common/ToastStack'

interface MessageModalProps {
  message: string
  onClose: () => void
}

function MessageModal({ message, onClose }: MessageModalProps) {
  const [text, setText] = useState(message)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying message', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[500px] p-6">
        <h3 className="text-lg font-semibold mb-4">Mensaje para enviar</h3>
        <textarea
          className="w-full h-40 p-2 border rounded bg-gray-50 dark:bg-gray-700 mb-4 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleCopy} variant="default">
            {copied ? '¡Copiado!' : 'Copiar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const tasks = useLiveQuery(() => db.tasks.toArray(), [])
  const { repositories } = useRepositories()
  const [copiedTask, setCopiedTask] = useState<number | null>(null)
  const [copiedBranch, setCopiedBranch] = useState<number | null>(null)
  const [copiedItemId, setCopiedItemId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  if (!tasks) return <p>Loading...</p>

  const today = new Date().toISOString().substring(0, 10)
  const todaysTasks = tasks.filter((t) => t.date === today)

  const weekday = new Date(today).getDay()
  const dailyTarget = weekday >= 1 && weekday <= 4 ? 8.5 : weekday === 5 ? 6 : 0
  const totalHours = todaysTasks.reduce((acc, t) => acc + (t.hours || 0), 0)
  const completedHours = todaysTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + (t.hours || 0), 0)
  const inProgressHours = todaysTasks
    .filter((t) => !t.completed && t.hours > 0)
    .reduce((acc, t) => acc + (t.hours || 0), 0)

  const progressCompleted =
    dailyTarget > 0 ? Math.min((completedHours / dailyTarget) * 100, 100) : 0
  const progressInProgress =
    dailyTarget > 0 ? Math.min((inProgressHours / dailyTarget) * 100, 100) : 0

  const JIRA_BASE = 'https://winsytemsintl.atlassian.net/browse/'
  const extractJiraKey = (name: string): string | null => {
    const match = name.match(/^(WIGOS-\d{4,6})/i)
    return match ? match[1] : null
  }

  const copyText = async (
    text: string,
    id: number,
    type: 'task' | 'branch' | 'itemId'
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'task') {
        setCopiedTask(id)
        setTimeout(() => setCopiedTask(null), 2000)
      } else if (type === 'branch') {
        setCopiedBranch(id)
        setTimeout(() => setCopiedBranch(null), 2000)
      } else {
        setCopiedItemId(id)
        setTimeout(() => setCopiedItemId(null), 2000)
      }
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }
  const toggleTaskCompleted = async (taskId: number, currentStatus: boolean) => {
    try {
      await db.tasks.update(taskId, { completed: !currentStatus });
    } catch (error) {
      console.error('Error updating task completion status:', error);
    }
  };
    const copyBranchName = async (text: string, id: number) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedTask(id)
        toast({ message: '📋 Nombre copiado al portapapeles', type: 'success' })
        setTimeout(() => setCopiedTask(null), 2000)
      } catch {
        toast({ message: '⚠️ Error al copiar el texto.', type: 'warn' })
      }
  }

  //console.log('Branch URL:', branchUrl);
  //console.log('Repository Name:', repoName);
  //console.log('Task Branch:', t.branch??'t.branch undefined');
  //console.log('Task Repository ID:', t.r??'t.r undefined');
  const handleOpenMessage = (
    jiraUrl: string | null,
    branchUrl: string | null,
    mergeIn?: string
  ) => {
    const messageText = `- Jira: ${jiraUrl || 'No Jira link'}\n\n- Pull Request: ${branchUrl || 'No Bitbucket link'
      }\n\n- Para mergear en: [${mergeIn || 'master'}].`
    setMessage(messageText)
  }

  return (
    <div>
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <WidgetCard
          title={t('dashboard.date')}
          value={new Date()
            .toLocaleString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
            .replace(',', '')}
          icon={<CalendarDays size={50} className="text-blue-500" />}
        />
        <WidgetCard
          icon={<Calculator size={50} className="text-amber-500" />}
          title={t('dashboard.tasksToday')}
          value={todaysTasks.length}
        />
        <WidgetCard
          icon={<Clock size={50} className="text-red-500" />}
          title={t('dashboard.totalHours')}
          value={totalHours.toFixed(1)}
        />
      </div>

      {/* Barra de progreso diaria */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {t('dashboard.dailyProgress')}
        </h3>
        <p className="text-sm mb-1">
          {t('dashboard.completed')}: {completedHours.toFixed(1)}h /{' '}
          {t('dashboard.target')}: {dailyTarget}h
        </p>
        <ProgressBar completed={progressCompleted} inProgress={progressInProgress} />
      </div>

      {/* Lista de tareas del día */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-1">{t('dashboard.todayTasks')}</h2>

        {todaysTasks.length > 0 ? (
          <ul role="list" className="divide-y divide-white/5">
            {todaysTasks.map((t) => {
              const jiraKey = extractJiraKey(t.name)
              const jiraUrl = jiraKey ? `${JIRA_BASE}${jiraKey}` : null
              const repo = repositories.find((r) => r.id === Number(t.repositoryId))
              const repoName = repo?.name
              const branchUrl = t.branch
                ? `https://bitbucket.org/wigos-dev/${repoName || 'repo'}/branch/${t.branch}`
                : repoName
                  ? `https://bitbucket.org/wigos-dev/${repoName}/branches`
                  : null
              const mergeInUrl = t.mergeIn
                ? `https://bitbucket.org/wigos-dev/${repoName || 'repo'}/branch/${t.mergeIn}`
                : repoName
                  ? `https://bitbucket.org/wigos-dev/${repoName}/branches`
                  : null

              return (
                <li className="flex justify-between gap-2 py-1" key={t.id}>
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg min-w-full border ${t.completed
                        ? 'border-green-400 bg-green-50 dark:border-green-600/30 dark:bg-green-900/30'
                        : 'border-orange-300 bg-yellow-50 dark:border-orange-600/30 dark:bg-yellow-900/30'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div className="flex min-w-0 flex-1 gap-x-2 items-start">
                        <span className="mt-10 size-15 flex-none inline-flex items-center rounded-full bg-green-400/10 p-2">
                          {t.completed ? (
                            <CheckCircle size={30} className="text-green-500 ml-1" />
                          ) : (
                            <Hammer size={30} className="text-yellow-500 ml-1" />
                          )}
                        </span>

                        <div className="flex flex-col gap-2 flex-1">
                          {/* Nombre */}
                          <p className="text-lg font-semibold text-white truncate line-clamp-3 text-wrap">
                            {t.name}
                          </p>

                          {/* Branch + mergeIn */}
                          {t.mergeIn && (
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} className="text-blue-500" />
                                <p className="text-md text-blue-500 font-mono truncate">
                                  {repoName} {"-->"} {t.mergeIn}
                                </p>
                                <button
                                  onClick={() => copyBranchName(t.mergeIn || '', t.id!)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                  title="Copiar rama de merge"
                                >
                                  <ClipboardCopy
                                    size={16}
                                    className={
                                      copiedTask === t.id ? 'text-green-500' : 'text-gray-400'
                                    }
                                  />
                                </button>
                                {mergeInUrl && (
                                  <a
                                    href={mergeInUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Abrir ticket en Jira"
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                  >
                                    <ExternalLink
                                      size={16}
                                      className="text-blue-500 hover:text-blue-400"
                                    />
                                  </a>
                                )}
                              </div>

                              {t.branch && (
                                <div className="flex items-center gap-2 pl-5">
                                  <GitBranch
                                    size={12}
                                    className="text-gray-400 dark:text-gray-500"
                                  />
                                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    ← {t.branch}
                                  </p>
                                  <button
                                    onClick={() => copyBranchName(t.branch||'', t.id!)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    title="Copiar rama de trabajo"
                                  >
                                    <ClipboardCopy
                                      size={16}
                                      className={
                                        copiedTask === t.id ? 'text-green-500' : 'text-gray-400'
                                      }
                                    />
                                  </button>
                                  {branchUrl && (
                                    <a
                                      href={branchUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Abrir ticket en Jira"
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                      <ExternalLink
                                        size={16}
                                        className="text-blue-500 hover:text-blue-400"
                                      />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Descripción */}
                          <div
                            className="p-2 border-gray-400 bg-gray-50 dark:border-gray-600/30 dark:bg-gray-900/30 text-sm text-gray-400 line-clamp-100 text-wrap font-mono"
                            dangerouslySetInnerHTML={{ __html: t.description }}
                          />
                        </div>
                      </div>

                      {/* Botonera derecha (2x3 grid) */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="grid grid-cols-3 gap-px">
                          <Button
                            variant="default"
                            size="md"
                            onClick={() => copyText(t.name, t.id!, 'task')}
                            title="Copiar nombre"
                          >
                            <ClipboardCopy size={14} />
                            Desc
                          </Button>

                          {t.itemId && (
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() => copyText(t.itemId, t.id!, 'itemId')}
                              title="Copiar ID de tarea"
                            >
                              <Link size={14} />
                              Id
                            </Button>
                          )}

                          {jiraUrl && (
                            <Button variant="ghost" size="md" title="Abrir en Jira">
                              <a
                                href={jiraUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={14} className='inline mr-2 mb-1.5' />
                                Jira
                              </a>
                            </Button>
                          )}

                          {branchUrl && (
                            <Button variant="success" size="md" title="Abrir en Bitbucket">
                              <a
                                href={branchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={14} className='inline mr-2 mb-1.5' />
                                BitBucket
                              </a>
                            </Button>
                          )}

                          <Button
                            variant="danger"
                            size="md"
                            onClick={() =>
                              handleOpenMessage(jiraUrl, branchUrl, t.mergeIn)
                            }
                            title="Generar mensaje PR"
                          >
                            <Mail size={14} />
                            Teams
                          </Button>

                          <Button
                            variant="warning"
                            size="md"
                            onClick={() => setEditId(t.id!)}
                            className="text-yellow-400"
                            title="Editar tarea"
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>
                        </div>

                        {/* ✅ Toggle + Horas */}
                        <div className="flex items-center gap-3 mt-2">
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleTaskCompleted(t.id!, t.completed)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${t.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              aria-pressed={t.completed}
                              aria-labelledby={`toggle-label-${t.id}`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${t.completed ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                              />
                            </button>
                            <span
                              id={`toggle-label-${t.id}`}
                              className={`text-sm font-medium ${t.completed
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                              {t.completed ? 'Completada' : 'En curso'}
                            </span>
                          </div>

                          {/* Horas */}
                          <div
                            className={`text-xl font-bold font-mono px-3 py-1 rounded-md shadow-sm ${t.completed
                                ? 'text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300'
                                : 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300'
                              }`}
                          >
                            <Clock size={18} className="inline mr-1.5 mb-0.5" />
                            {t.hours.toFixed(2)} h
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic">
            No hay tareas registradas para hoy.
          </p>
        )}
      </div>

      {message && <MessageModal message={message} onClose={() => setMessage(null)} />}
      {editId && <EditTaskModal taskId={editId} onClose={() => setEditId(null)} />}
    </div>
  )
}
