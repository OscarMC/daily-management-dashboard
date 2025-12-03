import festivosData from '../../public/data/festivos.json'

export interface Festivo {
 date: string
 nombre: string
 tipo: 'nacional' | 'local'
 recurrente?: boolean
}

/**
 * Devuelve la lista de festivos aplicables al año indicado.
 * Soporta festivos recurrentes (por mes/día) y únicos (con año explícito).
 */
export function getFestivosForYear(year: number): Festivo[] {
 return (festivosData as any[]).map((f) => {
  const tipo = f.tipo === 'local' ? 'local' : 'nacional'
  if (f.recurrente) {
   const [month, day] = f.date.split('-')
   return { ...f, tipo, date: `${new Date().getFullYear() }-${month}-${day}` }
  }
  return { ...f, tipo }
 })
}

/** Devuelve un Map YYYY-MM-DD → festivo */
export function getFestivosMap(year: number): Map<string, Festivo> {
 const festivos = getFestivosForYear(year)
 return new Map(festivos.map((f) => [f.date, f]))
}
