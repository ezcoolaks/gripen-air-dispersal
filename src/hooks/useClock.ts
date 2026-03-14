import { useState, useEffect } from 'react'
import { formatZuluTime } from '@/lib/utils'

export function useClock(): string {
  const [time, setTime] = useState(() => formatZuluTime(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatZuluTime(new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return time
}
