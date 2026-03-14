import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatZuluTime(date: Date): string {
  return (
    date.getUTCHours().toString().padStart(2, '0') +
    ':' +
    date.getUTCMinutes().toString().padStart(2, '0') +
    ':' +
    date.getUTCSeconds().toString().padStart(2, '0') +
    'Z'
  )

}

export function formatZuluShort(date: Date): string {
  return (
    date.getUTCHours().toString().padStart(2, '0') +
    ':' +
    date.getUTCMinutes().toString().padStart(2, '0') +
    'Z'
  )
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#00c88c'
  if (score >= 60) return '#f0a800'
  return '#e04040'
}

export function threatColor(level: string): string {
  switch (level) {
    case 'LOW': return '#00c88c'
    case 'MEDIUM': return '#f0a800'
    case 'HIGH': return '#e04040'
    case 'CRITICAL': return '#ff2040'
    default: return '#7090a8'
  }
}

export function entropyColor(level: string): string {
  switch (level) {
    case 'VERY HIGH': return '#00c88c'
    case 'HIGH': return '#00a8f0'
    case 'MEDIUM': return '#f0a800'
    case 'LOW': return '#e04040'
    default: return '#7090a8'
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Simple markdown-like bold renderer for chat
export function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/⚠/g, '<span class="warn-icon">⚠</span>')
    .replace(/\n/g, '<br/>')
}
