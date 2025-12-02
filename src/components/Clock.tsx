import { useEffect, useState } from 'react'

export default function Clock() {
 const [time, setTime] = useState<string>('')

 useEffect(() => {
  const updateTime = () => {
   setTime(new Date().toLocaleTimeString())
  }
  updateTime()
  const timer = setInterval(updateTime, 1000)
  return () => clearInterval(timer)
 }, [])

 return <div className="font-mono text-sm opacity-80">{time}</div>
}
