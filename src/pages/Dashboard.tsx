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
import { useAuth } from '../contexts/AuthContext'
import { usePullRequests } from '../hooks/usePullRequests'
import TaskCard from '../components/TaskCard'

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
  const { user } = useAuth()
  const { prs } = usePullRequests()

  const tasks = useLiveQuery(() => {
    if (!user) return []
    return db.tasks
      .where('userId')
      .equals(user.id)
      .toArray()
  }, [user?.id])

  const { repositories } = useRepositories()
  const [message, setMessage] = useState<string | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  if (!tasks) return <p>Cargando...</p>

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

  const allTaskDates = [...new Set(tasks.map(t => t.date))].sort((a, b) => b.localeCompare(a))
  const previousWorkDate = allTaskDates.find(date => date < today) || null
  const previousDayTasks = previousWorkDate
    ? tasks.filter(t => t.date === previousWorkDate)
    : []

  const handleOpenMessage = (
    jiraUrl: string | null,
    branchUrl: string | null,
    mergeIn?: string
  ) => {
    const messageText = `- Jira: ${jiraUrl || 'No Jira link'}\n\n- Pull Request: ${branchUrl || 'No Bitbucket link'}\n\n- Para mergear en: [${mergeIn || 'master'}].`
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
            {todaysTasks.map((t) => (
              <li className="flex justify-between gap-2 py-1" key={t.id}>
                <TaskCard
                  task={t}
                  onMessageOpen={handleOpenMessage}
                  onEdit={(id) => setEditId(id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic">
            No hay tareas registradas para hoy.
          </p>
        )}
      </div>

      {/* Tareas del día anterior */}
      {previousDayTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mt-6">
          <h2 className="text-lg font-semibold mb-1">
            {t('dashboard.previousWorkDayTasks')} —{' '}
            {new Date(previousWorkDate!).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </h2>
          <ul role="list" className="divide-y divide-white/5">
            {previousDayTasks.map((t) => (
              <li className="flex justify-between gap-2 py-1" key={`prev-${t.id}`}>
                <TaskCard
                  task={t}
                  isPreviousDay={true}
                  onMessageOpen={handleOpenMessage}
                  onEdit={(id) => setEditId(id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <MessageModal message={message} onClose={() => setMessage(null)} />}
      {editId && <EditTaskModal taskId={editId} onClose={() => setEditId(null)} />}
    </div>
  )
}