import { useEffect } from 'react'

interface ToastProps {
 type: 'success' | 'error'
 message: string
 onClose: () => void
}

export default function Toast({ type, message, onClose }: ToastProps) {
 useEffect(() => {
  const timer = setTimeout(onClose, 3000)
  return () => clearTimeout(timer)
 }, [onClose])

 const bgColor =
  type === 'success'
   ? 'bg-green-500 text-white'
   : 'bg-red-500 text-white'

 return (
  <div
   className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg text-sm animate-fadeIn ${bgColor}`}
  >
   {message}
  </div>
 )
}
