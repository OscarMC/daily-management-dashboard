import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  PartyPopper,
  Briefcase,
  Zap,
  Coffee,
  Timer,
  FileText,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import festivosData from '../../src/data/festivos.json'
import { motion } from "framer-motion"

interface JornadaDetalle {
  entrada: string
  salida: string
  concepto: string
  duracion: string
}

interface JornadaResumen {
  totalTrabajo: string
  totalPre: string
  totalDescansos: string
  tiempoRestante: string
  horaSalida: string
}

// utils hh:mm
const parseToMinutesHHMM = (time: string) => {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time.trim())) return 0
  const [h, m] = time.trim().split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
const formatToHHMM = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// jornada completa según día
const jornadaCompletaMin = (day: number) => {
  // 1=lunes ... 5=viernes
  if (day >= 1 && day <= 4) return 510
  if (day === 5) return 360
  return 0
}

export default function WorkingDaySummary() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10))
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([])
  const [detalle, setDetalle] = useState<JornadaDetalle[]>([])
  const [resumen, setResumen] = useState<JornadaResumen | null>(null)
  const [festivos] = useState<Map<string, any>>(new Map(festivosData.map(f => [new Date().getFullYear() + '-' + f.date, f])))
  const [horasJornada, setHorasJornada] = useState<Record<string, string>>({})
  const [jornadasCompletas, setJornadasCompletas] = useState<string[]>([])
  const todayStr = new Date().toISOString().substring(0, 10)

  // === cargar jornadas ===
  useEffect(() => {
    fetch('/public/data/jornadas.json')
      .then(r => r.json())
      .then(async (data: string[]) => {
        setDiasDisponibles(data)
        if (data.includes(todayStr)) setSelectedDate(todayStr)
        else if (data.length > 0) setSelectedDate(data[data.length - 1])

        const completas: string[] = []
        const horas: Record<string, string> = {}

        for (const fecha of data) {
          const filename = `resumen_jornada_${fecha.replace(/-/g, '')}.txt`
          try {
            const res = await fetch(`/public/working-day-results/${filename}`)
            if (!res.ok) continue
            const text = await res.text()
            const match = text.match(/Total\s+trabajado:[\s\t]+(\d{1,2}:\d{2})/)
            if (match) {
              const totalTrabajo = parseToMinutesHHMM(match[1])
              const day = new Date(fecha).getUTCDay() // 1=lun
              const limite = jornadaCompletaMin(day)
              if (limite > 0) {
                const capped = Math.min(totalTrabajo, limite)
                horas[fecha] = formatToHHMM(capped)
                if (totalTrabajo >= limite) completas.push(fecha)
              }
            }
          } catch { }
        }
        setJornadasCompletas(completas)
        setHorasJornada(horas)
      })
  }, [])

  // === cargar fichero seleccionado ===
  useEffect(() => {
    if (!selectedDate) return
    const filename = `resumen_jornada_${selectedDate.replace(/-/g, '')}.txt`
    fetch(`/public/working-day-results/${filename}`)
      .then(r => {
        if (!r.ok) throw new Error('No encontrado')
        return r.text()
      })
      .then(parsearJornada)
      .catch(err => console.error('Error leyendo jornada:', err))
  }, [selectedDate])

  const parsearJornada = (texto: string) => {
    const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean)
    const detalle: JornadaDetalle[] = []
    let totalTrabajo = '', totalPre = '', totalDescansos = '', tiempoRestante = '', horaSalida = ''
    for (const linea of lineas) {
      if (/^\d{2}:\d{2}:\d{2}/.test(linea)) {
        const partes = linea.split(/\s+/).filter(Boolean)
        if (partes.length >= 4) {
          const [entrada, salida, ...rest] = partes
          const concepto = rest.slice(0, rest.length - 1).join(' ')
          const duracion = rest[rest.length - 1]
          detalle.push({ entrada, salida, concepto, duracion })
        }
      } else if (/^Total\s+trabajado/i.test(linea)) totalTrabajo = linea.split('\t\t').pop()?.trim() || ''
      else if (/^Total\s+descansos/i.test(linea)) totalDescansos = linea.split('\t\t').pop()?.trim() || ''
      else if (/^Tiempo\s+restante/i.test(linea)) tiempoRestante = linea.split('\t\t').pop()?.trim() || ''
      else if (/^Hora\s+estimada/i.test(linea)) horaSalida = linea.split('\t\t').pop()?.trim() || ''
      else if (/^Total\sPreinicio/i.test(linea)) totalPre = linea.split('\t\t').pop()?.trim() || ''
    }

    const resumenFormateado: JornadaResumen = {
      totalTrabajo: formatToHHMM(parseToMinutesHHMM(totalTrabajo)),
      totalPre: formatToHHMM(parseToMinutesHHMM(totalPre)),
      totalDescansos: formatToHHMM(parseToMinutesHHMM(totalDescansos)),
      tiempoRestante: formatToHHMM(parseToMinutesHHMM(tiempoRestante)),
      horaSalida: horaSalida || '--:--',
    }
    setDetalle(detalle)
    setResumen(resumenFormateado)
  }

  const getDaysForCalendar = (date: Date) => {
    const y = date.getFullYear(), m = date.getMonth()
    const firstDay = new Date(Date.UTC(y, m, 1))
    const lastDay = new Date(Date.UTC(y, m + 1, 0))
    let startDay = firstDay.getUTCDay()
    if (startDay === 0) startDay = 7
    const prevDays = startDay - 1
    const days: Date[] = []
    for (let i = -prevDays; i < lastDay.getUTCDate(); i++) days.push(new Date(Date.UTC(y, m, i + 1)))
    return days
  }

  const days = getDaysForCalendar(currentMonth)
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es })
  const changeMonth = (delta: number) => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1))

  const totalSegundos = detalle.reduce((acc, d) => {
    const [h, m] = d.duracion.split(':').map(Number)
    return acc + h * 60 + m
  }, 0)

  // === render ===
  return (
    <div className="relative z-10 p-6">
    

      <div className="flex justify-center items-center mb-6 relative">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 absolute left-0"><ChevronLeft /></button>
        <h2 className="text-xl font-semibold capitalize text-center">{monthLabel}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 absolute right-0"><ChevronRight /></button>
      </div>

      {/* calendario */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map(day => {
          const dateStr = day.toISOString().substring(0, 10)
          const festivo = festivos.get(dateStr)
          const weekday = day.getUTCDay()
          const isWeekend = weekday === 6 || weekday === 0
          const isCurrentMonth = day.getUTCMonth() === currentMonth.getMonth()
          const isToday = dateStr === todayStr
          const isAvailable = diasDisponibles.includes(dateStr)
          const isComplete = jornadasCompletas.includes(dateStr)
          const horas = horasJornada[dateStr]

          let bgColor = 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
          if (!isCurrentMonth) bgColor += ' opacity-50'
          else if (isWeekend) bgColor = 'bg-gray-200 dark:bg-gray-700 opacity-60'
          else if (festivo) bgColor = 'bg-blue-100 dark:bg-blue-900/40'
          else if (isComplete) bgColor = 'bg-green-200 dark:bg-green-900/40 dark:border-green-700/10'
          else if (isAvailable) bgColor = 'bg-amber-100 dark:bg-amber-900/100 dark:border-amber-500'
          else bgColor = 'bg-gray-100 dark:bg-gray-700 opacity-30'

          return (
            <motion.div
              key={dateStr}
              onClick={() => isAvailable && setSelectedDate(dateStr)}

              // 👉 Animación SOLO si está completado
              initial={isComplete ? { scale: 0.9, opacity: 0 } : false}
              animate={isComplete ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.35, ease: "easeInOut" }}

              // 👉 Efectos tailwind sutiles
              className={`
          p-2 rounded-lg border text-sm h-20 flex flex-col justify-between 
          shadow-sm transition-all duration-500 
          ${isComplete ? 'shadow-green-300/50 ring-2 ring-green-400/40 animate-[pulse_2s_ease-in-out]' : ''}
          ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'} 
          ${bgColor}
        `}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center gap-1">
                  {day.getUTCDate()}
                  {isComplete ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : isAvailable ? (
                    <FileText size={20} className="text-blue-600" />
                  ) : null}
                </span>
                {isToday && <Clock size={14} className="text-blue-500" />}
              </div>

              {isAvailable && horas && (
                <div className="text-center font-mono text-[15px] text-gray-800 dark:text-gray-100 mt-1 leading-tight">
                  {horas}
                </div>
              )}

              {festivo?.tipo === 'local' && <PartyPopper size={40} className="mx-auto text-blue-400" />}
              {festivo?.tipo === 'nacional' && <PartyPopper size={40} className="mx-auto text-red-400" />}
              {festivo?.nombre}
            </motion.div>
          )
        })}
      </div>

      {/* resumen */}
      {resumen && (
        <div className={`p-4 rounded-lg mb-6 ${jornadasCompletas.includes(selectedDate) ? 'bg-green-50 dark:bg-green-900/20 border border-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400'}`}>
          <h3 className="text-lg font-semibold text-center mb-4">Jornada del {format(parseISO(selectedDate), "dd 'de' MMMM yyyy", { locale: es })}</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 p-3 rounded bg-purple-100 dark:bg-purple-900/30 shadow-sm"><Zap className="text-purple-600" /><span>Pre Inicio: {resumen.totalPre}</span></div>
            <div className="flex items-center gap-2 p-3 rounded bg-green-100 dark:bg-green-900/30 shadow-sm"><Briefcase className="text-green-600" /><span>Trabajado: {resumen.totalTrabajo}</span></div>
            <div className="flex items-center gap-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900/30 shadow-sm"><Coffee className="text-yellow-600" /><span>Descansos: {resumen.totalDescansos}</span></div>
            <div className="flex items-center gap-2 p-3 rounded bg-blue-100 dark:bg-blue-900/30 shadow-sm"><Clock className="text-blue-600" /><span>Salida: {resumen.horaSalida}</span></div>
            <div className="flex items-center gap-2 p-3 rounded bg-orange-100 dark:bg-orange-900/30 shadow-sm"><Timer className="text-orange-600" /><span>Restante: {resumen.tiempoRestante}</span></div>
          </div>
        </div>
      )}

      {/* stepper */}
      {detalle.length > 0 && (
        <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
          {detalle.map((d, i) => {
            const [h, m] = d.duracion.split(':').map(Number)
            const durMin = h * 60 + m
            const width = `${(durMin / totalSegundos) * 100}%`
            const left = `${(detalle.slice(0, i).reduce((acc, p) => {
              const [ph, pm] = p.duracion.split(':').map(Number)
              return acc + (ph * 60 + pm)
            }, 0) / totalSegundos) * 100}%`
            const color = d.concepto.toLowerCase().includes('desc')
              ? 'bg-yellow-400'
              : d.concepto.toLowerCase().includes('pre')
                ? 'bg-purple-500'
                : 'bg-green-500'
            return (
              <div key={i} className={`absolute top-0 h-full ${color}`}
                style={{ width, left }}
                title={`${d.concepto} — ${d.entrada} → ${d.salida} — ${d.duracion}`}>
                  <div className='text-md align-middle text-white font-semibold h-full flex justify-center items-center'>
                  {d.concepto.toLowerCase().includes('desc') && <Coffee className="text-yellow-600 size-7" />}
                  {d.concepto.toLowerCase().includes('pre') && <Zap className="text-purple-600 size-7" />}
                  {!d.concepto.toLowerCase().includes('desc') && !d.concepto.toLowerCase().includes('pre') && <Briefcase className="text-green-600 size-7" />}
                  </div>
              </div>
            )
          })}
        </div>
      )}

      {/* tabla */}
      {detalle.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <table className="w-full text-sm mb-4">
            <thead className="text-gray-500 border-b dark:border-gray-700"><tr><th className="text-left">Entrada</th><th className="text-left">Salida</th><th className="text-left">Concepto</th><th className="text-right">Duración</th></tr></thead>
            <tbody>
              {detalle.map((d, i) => (
                <tr key={i} className={`border-b border-gray-200 dark:border-gray-700 ${d.concepto.toLowerCase().includes('desc') ? 'text-yellow-600' : d.concepto.toLowerCase().includes('pre') ? 'text-purple-600' : 'text-green-700'}`}>
                  <td>{d.entrada}</td><td>{d.salida}</td><td className="font-medium">{d.concepto}</td><td className="text-right">{d.duracion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
