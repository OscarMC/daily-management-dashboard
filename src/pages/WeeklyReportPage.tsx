// src/pages/WeeklyReportPage.tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexieDB'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns';
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
  LabelList
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

  const [range, setRange] = useState<'today' | 'current-week' | 'last-week' | 'last-7-days' | 'current-month' | 'all'>(
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
      case 'today': {
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, -1)
        return { start, end }
      }
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
      case 'all': {
        const start = new Date(2023, 1, 1)
        const end = new Date(2027, 12, 31)
        return { start, end }
      }
      default:
        return { start: new Date(), end: new Date() }
    }
  }, [range])

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // payload[0].payload contiene el objeto de datos completo (d)
      const data = payload[0].payload;
      const formattedDate = data.date
        ? format(new Date(data.date), 'dd/MM/yyyy')
        : 'Fecha desconocida';

      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700 text-white font-sans">
          <p className="font-bold text-blue-400">{label}</p> {/* Muestra el día de la semana (Mo, Tu...) */}
          <p className="text-sm mt-1">
            <span className="font-semibold">Fecha:</span> {formattedDate}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Horas:</span> {data.hours.toFixed(1)}h
          </p>
        </div>
      );
    }

    return null;
  };

  // Helper para determinar si usar 'dayName' o 'date' en el eje X
  const xAxisDataKey = (range === 'current-month' || range === 'all') ? 'date' : 'dayName';

  // Formateador para los ticks del eje X cuando mostramos fechas completas
  const xAxisTickFormatter = (value: string) => {
    // value será "DD/MM/YYYY" o el formato de formatDate(current)
    if (!value) return '';

    // Asumimos formato DD/MM/YYYY como en tu sort() anterior
    const [day] = value.split('/');
    return day; // Devuelve solo el día del mes (ej: "15")
  };

  // Filtrar solo tareas del usuario en el rango
  const tasksInRange = useMemo(() => {
    if (!tasks) return []
    const startStr = formatDate(dateRange.start)
    const endStr = formatDate(dateRange.end)
    return tasks.filter((t) => t.date >= startStr && t.date < endStr)
  }, [tasks, dateRange])

  // Datos diarios (solo días con tareas)
  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; dayName: string; hours: number; taskCount: number }> =
      {}
    const dayNames = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
    let current = new Date(dateRange.start)

    while (current <= dateRange.end) {
      const dayOfWeek = current.getDay()

      // Filtramos aquí: solo incluimos Lunes (1) a Viernes (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const str = formatDate(current)
        map[str] = {
          date: str,
          dayName: dayNames[dayOfWeek],
          hours: 0,
          taskCount: 0,
        }
      }
      current.setDate(current.getDate() + 1)
    }
    // ... el resto del código para acumular horas ...
    tasksInRange.forEach((t) => {
      if (map[t.date]) {
        map[t.date].hours += t.hours || 0
        map[t.date].taskCount += 1
      }
    })
    console.log(tasksInRange)

    // Ordenar la lista por fecha ascendente
    return Object.values(map)
      .filter((d) => d.hours > 0)
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
  }, [tasksInRange, dateRange]);



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
              setRange(e.target.value as 'today' | 'current-week' | 'last-week' | 'last-7-days' | 'current-month' | 'all')
            }
            className="p-2 border rounded bg-white dark:bg-gray-800"
          >
            <option value="today">Hoy</option>
            <option value="current-week">Semana actual</option>
            <option value="last-week">Semana anterior</option>
            <option value="last-7-days">Últimos 7 días</option>
            <option value="current-month">Este mes</option>
            <option value="all">Todas</option>
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
              {/* CAMBIADO: Usamos xAxisDataKey dinámico y tickFormatter */}
              <XAxis
                dataKey={xAxisDataKey}
                tickFormatter={xAxisDataKey === 'date' ? xAxisTickFormatter : undefined}
              />
              <YAxis />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar dataKey="hours" fill="#4f46e5" name="Horas">
                {/* Etiqueta vertical superpuesta dentro de la barra (como pediste antes) */}
                <LabelList
                  dataKey="date"
                  position="center"
                  angle={-90}
                  offset={0}
                  fill="#ffffff"
                  fontSize={10}
                  style={{ textAnchor: 'middle', fontWeight: 'light', pointerEvents: 'none', fontSize: '12px' }}
                  formatter={(value) => {
                    if (!value || typeof value === 'boolean') return '';
                    // Devuelve la fecha completa en formato legible para la etiqueta interna
                    const d = new Date(value.split('/').reverse().join('-'));
                    return isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy');
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Por repositorio */}
      {repoData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Horas por proyecto/repositorio</h2>
          <div className="h-[25rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repoData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
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
              {dailyData.map((d, index) => (
                <tr
                  key={d.date}
                  // 'odd:bg...' aplica el color alterno automáticamente
                  className="border dark:border-gray-700 bg-white dark:bg-gray-800 odd:bg-gray-50 dark:odd:bg-gray-900/50"
                >
                  <td className="py-2 px-4 align-top font-medium">{d.dayName} {d.date}</td>
                  <td className="py-2 px-4">
                    <ul className="list-disc list-outside ml-5 space-y-2">
                      {tasksInRange
                        .filter((t) => t.date === d.date)
                        .map((t, idx) => (
                          <li
                            key={idx}
                            className="group relative text-gray-700 dark:text-gray-300 text-lg border border-gray-200 dark:border-gray-700 rounded p-1 px-2 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-help"
                          >
                            {t.name}

                            {/* Tooltip Enriquecido (se muestra al hacer hover en el LI) */}
                            {t.description && (
                              <div className="absolute z-150 hidden group-hover:block w-64 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl text-sm bottom-full mb-2 left-0 pointer-events-none">
                                <div
                                  className="prose prose-sm dark:prose-invert max-w-none overflow-hidden"
                                  // Renderiza el HTML de la descripción incluyendo imágenes
                                  dangerouslySetInnerHTML={{ __html: t.description }}
                                />
                                {/* Flecha del tooltip */}
                                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-600 rotate-45"></div>
                              </div>
                            )}
                          </li>
                        ))}
                    </ul>
                  </td>
                  <td className="py-2 px-4 text-right font-mono align-top">{d.hours.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  )
}