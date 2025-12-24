// src/pages/DailyTasks.tsx
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'
import AddTaskModal from '../components/common/AddTaskModal'
import EditTaskModal from '../components/common/EditTaskModal'
import CloneTaskModal from '../components/common/CloneTaskModal'
import {
  Pencil,
  Trash2,
  CheckCircle,
  ClipboardCopy,
  ExternalLink,
  Umbrella,
  Copy,
  FileText,
  GitBranch,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRepositories } from '../db/repositoriesStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from '../components/common/ToastStack'
import { useAuth } from '../contexts/AuthContext'
import { usePullRequests } from '../hooks/usePullRequests'
import PrStatusBadge from '../components/PrStatusBadge'
import JiraStatus from '../components/JiraStatus' // 👈 Importamos JiraStatus

const JIRA_BASE = 'https://winsytemsintl.atlassian.net/browse/'

// Helper: fecha local YYYY-MM-DD
const getTodayLocalISO = () => {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export default function DailyTasks() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  // ✅ Filtramos SOLO las tareas del userId actual
  const tasks = useLiveQuery(() => {
    if (!user) return []
    return db.tasks
      .where('userId')
      .equals(user.id)
      .toArray()
  }, [user?.id])

  const { repositories } = useRepositories()
  const { prs } = usePullRequests()

  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [cloneId, setCloneId] = useState<number | null>(null)
  const [copiedTask, setCopiedTask] = useState<number | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState(getTodayLocalISO())
  const [filterName, setFilterName] = useState('')
  const [filterDesc, setFilterDesc] = useState('')
  const [filterState, setFilterState] = useState('all')
  const [filterRepo, setFilterRepo] = useState('')
  const location = useLocation()

  // Detectar ?edit= desde Overview
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const editParam = params.get('edit')
    if (editParam) {
      setEditId(Number(editParam))
      window.history.replaceState({}, '', location.pathname)
    }
  }, [location])

  // === Acciones con Toasts ===
  const toggleComplete = async (id: number, completed: boolean) => {
    if (!user) return
    const task = await db.tasks.get(id)
    if (!task || task.userId !== user.id || task.type === 'VACACIONES') return
    const newStatus = !completed
    await db.tasks.update(id, { completed: newStatus })
    toast({
      message: newStatus
        ? `✅ Tarea completada: ${task.name}`
        : `↩️ Tarea marcada como pendiente: ${task.name}`,
      type: 'info',
    })
  }

  const deleteTask = async (id: number) => {
    if (!user) return
    const task = await db.tasks.get(id)
    if (!task || task.userId !== user.id) return
    await db.tasks.delete(id)
    toast({
      message: `🗑️ Tarea eliminada: ${task?.name || 'Desconocida'}`,
      type: 'warn',
    })
  }

  const copyTaskName = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTask(id)
      toast({ message: '📋 Nombre copiado al portapapeles', type: 'success' })
      setTimeout(() => setCopiedTask(null), 2000)
    } catch {
      toast({ message: '⚠️ Error al copiar el texto.', type: 'warn' })
    }
  }

  const extractJiraKey = (name: string): string | null => {
    const match = name.match(/^(WIGOS-\d{4,6})/i)
    return match ? match[1] : null
  }

  // === Filtros ===
  let filteredTasks = tasks || []
  if (dateFrom) filteredTasks = filteredTasks.filter((t) => t.date >= dateFrom)
  if (dateTo) filteredTasks = filteredTasks.filter((t) => t.date <= dateTo)
  if (filterName)
    filteredTasks = filteredTasks.filter((t) =>
      t.name.toLowerCase().includes(filterName.toLowerCase())
    )
  if (filterDesc)
    filteredTasks = filteredTasks.filter((t) =>
      (t.description || '').toLowerCase().includes(filterDesc.toLowerCase())
    )
  if (filterRepo)
    filteredTasks = filteredTasks.filter(
      (t) => String(t.repositoryId) === filterRepo
    )
  if (filterState !== 'all') {
    if (filterState === 'completed')
      filteredTasks = filteredTasks.filter((t) => t.completed)
    else if (filterState === 'pending')
      filteredTasks = filteredTasks.filter((t) => !t.completed)
    else if (filterState === 'vacaciones')
      filteredTasks = filteredTasks.filter((t) => t.type === 'VACACIONES')
  }

  // Orden DESC
  filteredTasks = filteredTasks.sort((a, b) => b.date.localeCompare(a.date))

  // === Agrupación avanzada ===
  const groupedByDate = filteredTasks.reduce((acc: any, t) => {
    if (!acc[t.date]) acc[t.date] = []
    acc[t.date].push(t)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  )

  const mergedRanges: { start: string; end: string; task: any }[] = []
  const processed: Set<string> = new Set()

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i]
    if (processed.has(date)) continue
    const dayTasks = groupedByDate[date]

    for (const task of dayTasks) {
      const sameTaskDays = [date]
      for (let j = i + 1; j < sortedDates.length; j++) {
        const prev = new Date(sortedDates[j - 1])
        const curr = new Date(sortedDates[j])
        const diff =
          (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          const nextDayTasks = groupedByDate[sortedDates[j]]
          const found = nextDayTasks.find((t: any) => t.name === task.name)
          if (found) {
            sameTaskDays.push(sortedDates[j])
            processed.add(sortedDates[j])
          } else break
        } else break
      }
      if (sameTaskDays.length > 1) {
        mergedRanges.push({
          start: sameTaskDays[sameTaskDays.length - 1],
          end: sameTaskDays[0],
          task: { ...task, count: sameTaskDays.length },
        })
      }
    }
  }

  // === Render ===
  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('menu.dailyTasks')}</h2>
        <button
          onClick={() => {
            if (!user) {
              toast({ message: '❌ Usuario no autenticado.', type: 'error' })
              return
            }
            const hasVacation = filteredTasks.some(
              (t) =>
                t.type === 'VACACIONES' &&
                t.date === new Date().toISOString().substring(0, 10)
            )
            if (hasVacation) {
              toast({
                message: '🌴 No se pueden añadir tareas en un día de vacaciones.',
                type: 'warn',
              })
              return
            }
            setShowAdd(true)
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t('tasks.new')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Desde:</label>
          <input
            type="date"
            className="ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Hasta:</label>
          <input
            type="date"
            className="ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Nombre:</label>
          <input
            type="text"
            placeholder="Buscar..."
            className="ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Descripción:</label>
          <input
            type="text"
            placeholder="Buscar..."
            className="ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700"
            value={filterDesc}
            onChange={(e) => setFilterDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Estado:</label>
          <select
            className="ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="completed">Completadas</option>
            <option value="pending">Pendientes</option>
            <option value="vacaciones">Vacaciones</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Repositorio:</label>
          <select
            className="ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700"
            value={filterRepo}
            onChange={(e) => setFilterRepo(e.target.value)}
          >
            <option value="">Todos</option>
            {repositories.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-8">
        {sortedDates.map((date) => {
          const isPartOfRange = mergedRanges.some(
            (r) => new Date(date) <= new Date(r.start) && new Date(date) >= new Date(r.end)
          )
          if (isPartOfRange) return null

          const dayTasks = groupedByDate[date]
          const hasVacation = dayTasks.some((t: any) => t.type === 'VACACIONES')

          return (
            <div key={date}>
              <h3 className="text-lg font-semibold mb-2 border-b border-gray-300 dark:border-gray-700 pb-1">
                {new Date(date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </h3>

              {dayTasks.map((t: any) => renderTaskCard(t))}
              {hasVacation && (
                <p className="text-teal-600 dark:text-teal-400 text-sm italic mt-1">
                  🌴 Día marcado como vacaciones — no se pueden crear otras tareas.
                </p>
              )}
            </div>
          )
        })}

        {mergedRanges.map((g, idx) => (
          <div key={`merged-${idx}`}>
            <h3 className="text-lg font-semibold mb-2 border-b border-gray-300 dark:border-gray-700 pb-1">
              {new Date(g.start).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
              })}{' '}
              -{' '}
              {new Date(g.end).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </h3>
            {renderTaskCard(g.task, g.task.count)}
          </div>
        ))}
      </div>

      {/* Modales */}
      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdded={() => setShowAdd(false)} />}
      {editId && <EditTaskModal taskId={editId} onClose={() => setEditId(null)} />}
      {cloneId && <CloneTaskModal taskId={cloneId} onClose={() => setCloneId(null)} />}
    </div>
  )

  // === Tarjeta de tarea ===
  function renderTaskCard(t: any, count?: number) {
    const jiraKey = extractJiraKey(t.name)
    const jiraUrl = jiraKey ? `${JIRA_BASE}${jiraKey}` : null
    const repo = repositories.find((r) => r.id === Number(t.repositoryId))
    const repoName = repo?.name

    // 👇 Buscar PR asociado a esta tarea
    const associatedPr = prs.find(
      (pr) =>
        String(pr.taskId) === String(t.id) ||
        (typeof pr.taskId === 'string' && pr.taskId.includes(String(t.id)))
    )

    const isVacation = t.type === 'VACACIONES'
    const isOther = t.type === 'OTROS'

    return (
      <div
        key={t.id}
        className={`p-4 rounded-lg border shadow-sm flex justify-between items-center mb-2 ${isVacation
          ? 'bg-teal-100 dark:bg-teal-900/40 border-teal-400'
          : t.completed
            ? 'bg-green-50 dark:bg-green-900/30 border-green-400'
            : isOther
              ? 'bg-slate-100 dark:bg-amber-950 border-amber-500'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-600'
          }`}
      >
        <div className="flex flex-col max-w-[1500px]">
          <div className="flex items-center gap-2 flex-wrap">
            {isVacation ? (
              <span className="flex items-center text-teal-700 dark:text-teal-300 font-semibold text-lg">
                <Umbrella className="w-5 h-5 mr-1 text-teal-500" />
                VACACIONES - Día libre
              </span>
            ) : isOther ? (
              <span className="flex items-center text-slate-700 dark:text-slate-300 font-semibold text-lg">
                <FileText className="w-5 h-5 mr-1 text-slate-500" />
                OTROS - {t.name}
              </span>
            ) : (
              <>
                <p
                  className="font-medium text-md truncate max-w-[1000px]"
                  title={t.name}
                >
                  {t.name} {count && <span>(x{count})</span>}
                </p>
                <button
                  onClick={() => copyTaskName(t.name, t.id!)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Copiar nombre de tarea"
                >
                  <ClipboardCopy
                    size={16}
                    className={
                      copiedTask === t.id ? 'text-green-500' : 'text-gray-400'
                    }
                  />
                </button>
                {jiraUrl && (
                  <a
                    href={jiraUrl}
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
              </>
            )}
          </div>

          {/* 👇 Renderizamos JiraStatus SOLO si hay clave Jira válida */}
          {jiraKey && (
            <div className="mt-1">
              <JiraStatus issueKey={jiraKey} />
            </div>
          )}

          {t.description && (
            <p
              className="text-sm text-gray-600 dark:text-gray-300 mt-1"
              dangerouslySetInnerHTML={{ __html: t.description }}>
            </p>
          )}

          {!isVacation && (
            <>
              {t.mergeIn && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GitBranch size={14} className="text-blue-500" />
                    <p className="text-md text-blue-500 font-mono truncate">
                      {repoName} {"-->"} {t.mergeIn}
                    </p>
                    {/* 👇 Badge del PR (clickeable) */}
                    {associatedPr && (
                      <button
                        onClick={() => navigate('/prs')}
                        className="cursor-pointer"
                        title={`Ver PR: ${associatedPr.title}`}
                      >
                        <PrStatusBadge status={associatedPr.status} />
                      </button>
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
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500">{t.hours}h — {t.date}</p>
            </>
          )}
        </div>

        {/* === Botones de acción === */}
        <div className="flex items-center text-xs font-medium min-w-fit">
          {!isVacation && (
            <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => toggleComplete(t.id!, t.completed)}
                className={`flex items-center gap-1 px-2 py-1.5 transition-colors ${t.completed
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                title={
                  t.completed ? 'Marcar como pendiente' : 'Marcar como completada'
                }
              >
                <CheckCircle size={16} />
                <span>{t.completed ? '✔' : 'X'}</span>
              </button>

              <button
                onClick={() => setCloneId(t.id!)}
                className="flex items-center gap-1 px-2 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600 transition-colors border-l border-gray-300 dark:border-gray-600"
                title="Clonar tarea"
              >
                <Copy size={16} />
                <span>Clonar</span>
              </button>
            </div>
          )}

          <div
            className={`flex ${!isVacation ? 'ml-1' : ''} rounded-md overflow-hidden border border-gray-300 dark:border-gray-600`}
          >
            <button
              onClick={() => setEditId(t.id!)}
              className="flex items-center gap-1 px-2 py-1.5 bg-yellow-400 text-gray-800 hover:bg-yellow-500 transition-colors"
              title="Editar tarea"
            >
              <Pencil size={16} />
              <span>Editar</span>
            </button>
            <button
              onClick={() => deleteTask(t.id!)}
              className="flex items-center gap-1 px-2 py-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors border-l border-gray-300 dark:border-gray-600"
              title="Eliminar tarea"
            >
              <Trash2 size={16} />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}