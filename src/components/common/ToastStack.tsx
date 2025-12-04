import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'info' | 'warn' | 'error' | 'default'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

// 🔁 Variable global para permitir llamadas desde cualquier parte
let globalAddToast:
  | ((msg: string | { message: string; type: ToastType }, type?: ToastType) => void)
  | null = null

export function useToastStack() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  const addToast = (
    input: string | { message: string; type: ToastType },
    maybeType?: ToastType
  ) => {
    const id = Date.now()
    const message = typeof input === 'string' ? input : input.message
    const type = typeof input === 'string' ? maybeType || 'info' : input.type

    //console.log('%c[Toast]', 'color:lime', { id, message, type })

    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  // 🔗 Guarda la referencia global una sola vez
  useEffect(() => {
    globalAddToast = addToast
    return () => {
      if (globalAddToast === addToast) globalAddToast = null
    }
  }, [])

  const ToastContainer = () => (
    <div className="fixed top-6 right-6 z-[999999] space-y-3 pointer-events-none flex flex-col items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white font-medium pointer-events-auto transition-all duration-300 ease-in-out
          ${t.type === 'success' ? 'bg-green-600' : ''}
          ${t.type === 'info' ? 'bg-blue-600' : ''}
          ${t.type === 'warn' ? 'bg-yellow-500 text-gray-900' : ''}
          ${t.type === 'error' ? 'bg-red-600' : ''}
          ${t.type === 'default' ? 'bg-gray-600' : ''}`}
        >
          {t.type === 'success' && <CheckCircle2 size={18} />}
          {t.type === 'info' && <Info size={18} />}
          {t.type === 'warn' && <AlertTriangle size={18} />}
          {t.type === 'error' && <AlertTriangle size={18} />}
          <span className="flex-1 text-sm">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="hover:opacity-75 transition"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )

  return { ToastContainer }
}

// ✅ Función global accesible desde cualquier componente
export const toast = (
  input: string | { message: string; type: ToastType },
  maybeType?: ToastType
) => {
  if (!globalAddToast) {
    console.warn('⚠️ Toast system not initialized yet.')
    return
  }
  globalAddToast(input, maybeType)
}
