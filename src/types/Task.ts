export interface Task {
 id?: number
 name: string
 description: string
 branch: string
 estimated: string
 completed: boolean
 createdAt: string
 /** Fecha a la que pertenece la tarea (día imputado) */
 date: string
 /** Horas imputadas a esta tarea */
 hours: number
}
