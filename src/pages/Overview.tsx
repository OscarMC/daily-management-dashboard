import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'
import ProgressBar from '../components/common/ProgressBar'
import EditTaskModal from '../components/common/EditTaskModal'
import AddTaskModal from '../components/common/AddTaskModal'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PartyPopper,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pencil,
  Umbrella,
  Trash2,
  PlusCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getFestivosMap } from '../hooks/useFestivos'
import { toast } from '../components/common/ToastStack'
import { useAuth } from '../contexts/AuthContext' // 👈 Nuevo

export default function Overview() {
  const { user } = useAuth() // 👈 Usuario autenticado

  // ✅ Filtramos SOLO las tareas del userId actual
  const tasks = useLiveQuery(() => {
    if (!user) return []
    return db.tasks
      .where('userId')
      .equals(user.id)
      .toArray()
  }, [user?.id])

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  if (!tasks) return <p>Cargando...</p>

  const year = currentMonth.getFullYear()
  const festivosMap = getFestivosMap(year)
  const todayStr = new Date().toISOString().substring(0, 10)

  const parseLocalDate = (str: string) => {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
  }

  const getDaysForCalendar = (date: Date) => {
    const y = date.getFullYear()
    const m = date.getMonth()
    const firstDay = new Date(Date.UTC(y, m, 1))
    const lastDay = new Date(Date.UTC(y, m + 1, 0))
    let startDay = firstDay.getUTCDay()
    if (startDay === 0) startDay = 7
    const prevDays = startDay - 1
    const days: Date[] = []
    for (let i = -prevDays; i < lastDay.getUTCDate(); i++) {
      days.push(new Date(Date.UTC(y, m, i + 1)))
    }
    return days
  }

  const days = getDaysForCalendar(currentMonth)
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es })

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth() + delta, 1))
    setSelectedDate(null)
  }

  const grouped = tasks.reduce<Record<
    string,
    { total: number; completed: number; inProgress: number; hasVacation?: boolean }
  >>((acc, t) => {
    const key = t.date
    if (!key) return acc
    if (!acc[key]) acc[key] = { total: 0, completed: 0, inProgress: 0 }
    if (t.type === 'VACACIONES') {
      acc[key].hasVacation = true
    } else {
      acc[key].total += t.hours || 0
      if (t.completed) acc[key].completed += t.hours || 0
      else acc[key].inProgress += t.hours || 0
    }
    return acc
  }, {})

  const getTasksByDate = (date: string) => tasks.filter((t) => t.date === date)
  const JIRA_BASE = 'https://winsytemsintl.atlassian.net/browse/'
  const extractJiraKey = (name: string) => name.match(/^(WIGOS-\d{4,6})/i)?.[1] || null

  const handleTaskUpdated = () => toast('✅ Tarea actualizada correctamente', 'info')
  const handleTaskAdded = () => toast('🆕 Nueva tarea creada correctamente', 'success')
  const handleTaskDeleted = (name: string) => toast(`⚠️ Tarea "${name}" eliminada`, 'warn')

  const handleDelete = async (id: number) => {
    if (!user) return
    const task = await db.tasks.get(id)
    if (!task || task.userId !== user.id) return // 👈 Defensivo
    await db.tasks.delete(id)
    handleTaskDeleted(task.name)
  }

  return (
    <div className="relative z-10">
      {/* Navegación del mes */}
      <div className="flex justify-center items-center mb-6 relative z-10">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 absolute left-0"
        >
          <ChevronLeft />
        </button>
        <h2 className="text-xl font-semibold capitalize text-center">{monthLabel}</h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 absolute right-0"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Encabezado días */}
      <div className="grid grid-cols-7 gap-2 text-center text-gray-600 dark:text-gray-400 font-semibold mb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = day.toISOString().substring(0, 10)
          const festivo = festivosMap.get(dateStr)
          const { completed = 0, inProgress = 0, hasVacation = false } = grouped[dateStr] || {}
          const weekday = day.getUTCDay()
          const dailyTarget = weekday >= 1 && weekday <= 4 ? 8.5 : weekday === 5 ? 6 : 0

          const completedPct = dailyTarget > 0 ? Math.min((completed / dailyTarget) * 100, 100) : 0
          const inProgressPct = dailyTarget > 0 ? Math.min((inProgress / dailyTarget) * 100, 100) : 0
          const totalHours = completed + inProgress
          const totalPct = completedPct + inProgressPct

          const isWeekend = weekday === 6 || weekday === 0
          const isCurrentMonth = day.getUTCMonth() === currentMonth.getMonth()
          const isPast = dateStr < todayStr
          const isToday = dateStr === todayStr

          let bgColor = 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
          if (!isCurrentMonth) bgColor += ' opacity-50'
          else if (isWeekend)
            bgColor = 'bg-gray-200 dark:bg-gray-700 opacity-60 cursor-not-allowed'
          else if (festivo)
            bgColor =
              festivo.tipo === 'nacional'
                ? 'bg-blue-100 dark:bg-blue-900/40'
                : 'bg-cyan-100 dark:bg-cyan-900/40'
          else if (hasVacation)
            bgColor = 'bg-[#4DD0E1]/40 border-[#4DD0E1] dark:bg-[#4DD0E1]/30'
          else if (totalPct >= 99.9)
            bgColor = 'bg-green-100 dark:bg-green-900/30 border-green-400'
          else if (totalPct > 0 && totalPct < 99.9)
            bgColor = 'bg-amber-100 dark:bg-amber-900/30 border-amber-400'

          const canOpen = (!isWeekend && (isPast || isToday)) || festivo || hasVacation

          return (
            <div
              key={dateStr}
              onClick={() => canOpen && setSelectedDate(dateStr)}
              className={`relative p-2 rounded-lg border text-sm h-28 flex flex-col justify-between shadow-sm transition-all cursor-pointer ${bgColor} ${isToday ? 'ring-2 ring-blue-400 animate-pulse' : ''
                }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{day.getUTCDate()}</span>
                {totalPct > 0 && !festivo && !isWeekend && !hasVacation && (
                  <span className="text-xs">{Math.min(totalPct, 100).toFixed(0)}%</span>
                )}
              </div>

              {festivo ? (
                <div className="flex flex-col items-center justify-center mt-auto">
                  <PartyPopper
                    size={30}
                    className={`${festivo.tipo === 'nacional'
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-cyan-500 dark:text-cyan-400'
                      }`}
                  />
                  <p className="text-xs font-bold mt-1 text-center">{festivo.nombre}</p>
                </div>
              ) : hasVacation ? (
                <div className="flex flex-col items-center justify-center mt-auto">
                  <Umbrella size={32} className="text-[#4DD0E1]" />
                  <p className="text-xs font-semibold text-[#00838F] dark:text-[#4DD0E1] mt-1">
                    VACACIONES
                  </p>
                </div>
              ) : (
                <div className="mt-auto">
                  <ProgressBar completed={completedPct} inProgress={inProgressPct} />
                  <p className="text-[11px] text-gray-500 text-center mt-1">
                    {totalHours.toFixed(1)}h / {dailyTarget}h
                  </p>
                  <div className="flex justify-center mt-1">
                    {isToday ? (
                      <Clock size={14} className="text-blue-500" />
                    ) : totalPct >= 99.9 ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : isPast && totalPct < 99.9 ? (
                      <AlertTriangle size={14} className="text-amber-600" />
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal detalle día */}
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              Tareas del {format(parseLocalDate(selectedDate), "dd 'de' MMMM yyyy", { locale: es })}
            </h3>

            {getTasksByDate(selectedDate).length > 0 ? (
              getTasksByDate(selectedDate).map((t) => {
                const jiraKey = extractJiraKey(t.name)
                const jiraUrl = jiraKey ? `${JIRA_BASE}${jiraKey}` : null
                const isVacation = t.type === 'VACACIONES'

                return (
                  <div
                    key={t.id}
                    className={`p-3 mb-2 rounded-lg border ${isVacation
                      ? 'border-[#4DD0E1] bg-[#4DD0E1]/20'
                      : t.completed
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{t.name}</p>
                      {!isVacation && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditId(t.id!)}
                            className="p-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                            title="Editar tarea"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id!)}
                            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded"
                            title="Eliminar tarea"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    {jiraUrl && (
                      <a
                        href={jiraUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline text-sm mt-1"
                      >
                        <ExternalLink size={14} /> {jiraKey}
                      </a>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {t.description}
                    </p>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 italic text-sm">No hay tareas registradas.</p>
            )}

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowAdd(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <PlusCircle size={16} /> Añadir tarea
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {editId && (
        <EditTaskModal
          taskId={editId}
          onClose={() => {
            setEditId(null)
            handleTaskUpdated()
          }}
        />
      )}

      {/* Modal nueva tarea */}
      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            handleTaskAdded()
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}