import type { ReleaseItemModel } from '@/app/generated/prisma/models'

export function calculateReadiness(items: ReleaseItemModel[]) {
  if (items.length === 0) return { score: 0, isGo: false, completedRequired: 0, totalRequired: 0, completedTotal: 0 }

  const required = items.filter((i) => i.required)
  const completedRequired = required.filter((i) => i.completed).length
  const completedTotal = items.filter((i) => i.completed).length
  const score = Math.round((completedTotal / items.length) * 100)
  const isGo = required.length > 0 && completedRequired === required.length

  return { score, isGo, completedRequired, totalRequired: required.length, completedTotal }
}

export function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}
