// src/pages/WeeklyReportPage.tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Button } from '../components/ui/Button'
import { toast } from '../components/common/ToastStack'
import { useRepositories } from '../db/repositoriesStore';

const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6']

export default function WeeklyReportPage() {
  const { user } = useAuth()
  const tasks = useLiveQuery(() => {
    if (!user) return []
    return db.tasks.where('userId').equals(user.id).toArray()
  }, [user?.id])

  const repositories = useRepositories()

  // Redirigir si no hay usuario (aunque AuthProvider ya debería evitar esto)
  useEffect(() => {
    if (!user) {
      // Normalmente esto no debería ocurrir si usas rutas protegidas
      console.warn('Acceso a WeeklyReport sin autenticación')
    }
  }, [user])

  const [range, setRange] = useState<'current-week' | 'last-week' | 'last-7-days' | 'current-month'>(
    'current-week'
  )

  // Helper: obtener rango de fechas según selección
  const getWeekRange = (offset: number = 0) => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
    const start = new Date(now.setDate(diff))
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start, end }
  }

  const dateRange = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (range) {
      case 'current-week': {
        const { start, end } = getWeekRange(0)
        return { start, end }
      }
      case 'last-week': {
        const { start, end } = getWeekRange(-1)
        return { start, end }
      }
      case 'last-7-days': {
        const start = new Date(today)
        start.setDate(today.getDate() - 6)
        return { start, end: today }
      }
      case 'current-month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { start, end }
      }
      default:
        return { start: new Date(), end: new Date() }
    }
  }, [range])

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  // Filtrar solo tareas del usuario en el rango
  const tasksInRange = useMemo(() => {
    if (!tasks) return []
    const startStr = formatDate(dateRange.start)
    const endStr = formatDate(dateRange.end)
    return tasks.filter((t) => t.date >= startStr && t.date <= endStr)
  }, [tasks, dateRange])

  // Datos diarios (solo días con tareas)
  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; dayName: string; hours: number; taskCount: number }> =
      {}
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    let current = new Date(dateRange.start)
    while (current <= dateRange.end) {
      const str = formatDate(current)
      map[str] = {
        date: str,
        dayName: dayNames[current.getDay()],
        hours: 0,
        taskCount: 0,
      }
      current.setDate(current.getDate() + 1)
    }

    tasksInRange.forEach((t) => {
      if (map[t.date]) {
        map[t.date].hours += t.hours || 0
        map[t.date].taskCount += 1
      }
    })

    return Object.values(map).filter((d) => d.hours > 0)
  }, [tasksInRange, dateRange])

  // Horas agrupadas por repositorio (solo del usuario)
  const repoData = useMemo(() => {
    if (!repositories || !tasksInRange.length) return []
    const map = new Map<string, number>()
    tasksInRange.forEach((t) => {
      const repo = repositories.repositories.find((r) => r.id === Number(t.repositoryId))
      const name = repo?.name || 'Otros'
      map.set(name, (map.get(name) || 0) + (t.hours || 0))
    })
    return Array.from(map, ([name, hours]) => ({ name, hours }))
  }, [tasksInRange, repositories])

  // Generar resumen para copiar (solo del usuario)
  const generateSummaryText = () => {
    let text = `**Resumen de horas (${formatDate(dateRange.start)} → ${formatDate(
      dateRange.end
    )})**\n\n`
    dailyData.forEach((d) => {
      text += `- ${d.dayName} ${d.date}: ${d.hours.toFixed(1)}h (${d.taskCount} tareas)\n`
    })
    text += `\nTotal: ${dailyData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h`
    return text
  }

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText())
      toast({ message: '📋 Resumen copiado para Teams', type: 'success' })
    } catch {
      toast({ message: 'Error al copiar', type: 'error' })
    }
  }

  if (!user || !tasks || !repositories) {
    return <div className="p-6">Cargando...</div>
  }

  const totalHours = dailyData.reduce((sum, d) => sum + d.hours, 0)
  const workedDays = dailyData.length
  const expectedDays = range === 'current-month' ? 22 : 5
  const avgDaily = workedDays > 0 ? totalHours / workedDays : 0

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Resumen de Actividad</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            value={range}
            onChange={(e) =>
              setRange(e.target.value as 'current-week' | 'last-week' | 'last-7-days' | 'current-month')
            }
            className="p-2 border rounded bg-white dark:bg-gray-800"
          >
            <option value="current-week">Semana actual</option>
            <option value="last-week">Semana anterior</option>
            <option value="last-7-days">Últimos 7 días</option>
            <option value="current-month">Este mes</option>
          </select>
          <Button onClick={handleCopySummary} variant="default">
            Copiar para Teams
          </Button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
          <div className="text-sm text-blue-700 dark:text-blue-300">Total horas</div>
          <div className="text-xl font-bold">{totalHours.toFixed(1)}h</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
          <div className="text-sm text-green-700 dark:text-green-300">Días imputados</div>
          <div className="text-xl font-bold">{workedDays}/{expectedDays}</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded">
          <div className="text-sm text-amber-700 dark:text-amber-300">Promedio diario</div>
          <div className="text-xl font-bold">{avgDaily.toFixed(1)}h</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
          <div className="text-sm text-purple-700 dark:text-purple-300">Tareas totales</div>
          <div className="text-xl font-bold">{tasksInRange.length}</div>
        </div>
      </div>

      {/* Gráfico diario */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Horas por día</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="dayName" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value}h`, 'Horas']}
                labelFormatter={(label) => `Día: ${label}`}
              />
              <Bar dataKey="hours" fill="#4f46e5" name="Horas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Por repositorio */}
      {repoData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Horas por proyecto/repositorio</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repoData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                  nameKey="name"
                  label={({ name, percent }) => {
                    const pct = percent != null ? (percent * 100).toFixed(0) : '0'
                    return `${name}: ${pct}%`
                  }}
                >
                  {repoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}h`, 'Horas']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla detallada */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Detalles por día</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2 px-4 text-left">Fecha</th>
                <th className="py-2 px-4 text-left">Tareas</th>
                <th className="py-2 px-4 text-right">Horas</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((d) => (
                <tr key={d.date} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4">{d.dayName} {d.date}</td>
                  <td className="py-2 px-4">
                    {tasksInRange
                      .filter((t) => t.date === d.date)
                      .map((t) => t.name)
                      .join(', ')}
                  </td>
                  <td className="py-2 px-4 text-right font-mono">{d.hours.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}