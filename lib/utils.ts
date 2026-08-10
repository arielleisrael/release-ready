import type { ReleaseItemModel } from '@/app/generated/prisma/models'

export type ReadinessOptions = {
  features?: { codeComplete: boolean }[]
  codeFreezeConfirmed?: boolean
  noUnplannedFeatures?: boolean
}

/**
 * Calculates overall readiness score and go/no-go status for a release.
 * Score includes checklist items, features, and the two release-level gates.
 */
export function calculateReadiness(items: ReleaseItemModel[], options: ReadinessOptions = {}) {
  const { features = [], codeFreezeConfirmed = false, noUnplannedFeatures = false } = options

  const requiredItems = items.filter((i) => i.required)
  const completedRequired = requiredItems.filter((i) => i.completed).length
  const completedChecklist = items.filter((i) => i.completed).length
  const completedFeatures = features.filter((f) => f.codeComplete).length
  const gatesCompleted = (codeFreezeConfirmed ? 1 : 0) + (noUnplannedFeatures ? 1 : 0)

  // Total always includes checklist items, any features, and both release-level gates.
  const totalItems = items.length + features.length + 2
  const completedTotal = completedChecklist + completedFeatures + gatesCompleted
  const score = totalItems === 0 ? 0 : Math.round((completedTotal / totalItems) * 100)

  const isGo =
    requiredItems.length > 0 &&
    completedRequired === requiredItems.length &&
    features.every((f) => f.codeComplete) &&
    codeFreezeConfirmed &&
    noUnplannedFeatures

  return {
    score,
    isGo,
    completedRequired,
    totalRequired: requiredItems.length,
    completedTotal,
    totalItems,
  }
}

/** Returns the Tailwind text-color class for a readiness score. */
export function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

/** Returns the Tailwind background-color class for a progress bar at a given score. */
export function progressBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

/** Formats a date as "MMM D, YYYY". */
export function formatDate(date: Date | string | null | undefined) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

const CATEGORY_PALETTE = [
  { pill: 'bg-blue-100 text-blue-700', header: 'text-blue-700 border-blue-200 bg-blue-50' },
  { pill: 'bg-violet-100 text-violet-700', header: 'text-violet-700 border-violet-200 bg-violet-50' },
  { pill: 'bg-red-100 text-red-700', header: 'text-red-700 border-red-200 bg-red-50' },
  { pill: 'bg-orange-100 text-orange-700', header: 'text-orange-700 border-orange-200 bg-orange-50' },
  { pill: 'bg-emerald-100 text-emerald-700', header: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  { pill: 'bg-sky-100 text-sky-700', header: 'text-sky-700 border-sky-200 bg-sky-50' },
  { pill: 'bg-pink-100 text-pink-700', header: 'text-pink-700 border-pink-200 bg-pink-50' },
]

/** Returns header and pill color classes for a category by its display index. Cycles through a fixed palette. */
export function getCategoryStyle(index: number) {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
}
