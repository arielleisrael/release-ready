export type ChecklistItemTemplate = {
  category: string
  title: string
  description?: string
  required: boolean
  order: number
}

export const CATEGORIES = ['Testing', 'Documentation', 'Security', 'Operations', 'Sign-off'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_STYLES: Record<Category, { pill: string; header: string }> = {
  Testing:       { pill: 'bg-blue-100 text-blue-700',    header: 'text-blue-700 border-blue-200 bg-blue-50' },
  Documentation: { pill: 'bg-violet-100 text-violet-700', header: 'text-violet-700 border-violet-200 bg-violet-50' },
  Security:      { pill: 'bg-red-100 text-red-700',      header: 'text-red-700 border-red-200 bg-red-50' },
  Operations:    { pill: 'bg-orange-100 text-orange-700', header: 'text-orange-700 border-orange-200 bg-orange-50' },
  'Sign-off':    { pill: 'bg-emerald-100 text-emerald-700', header: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
}

export const DEFAULT_CHECKLIST: ChecklistItemTemplate[] = [
  // Testing
  { category: 'Testing', title: 'All automated tests passing in CI',          required: true,  order: 1 },
  { category: 'Testing', title: 'Manual regression testing complete',          required: true,  order: 2 },
  { category: 'Testing', title: 'New features have test coverage',             required: true,  order: 3 },
  { category: 'Testing', title: 'Performance benchmarks within acceptable range', required: false, order: 4 },
  { category: 'Testing', title: 'Accessibility review complete',               required: false, order: 5 },

  // Documentation
  { category: 'Documentation', title: 'User-facing documentation updated',    required: true,  order: 1 },
  { category: 'Documentation', title: 'Release notes drafted',                required: true,  order: 2 },
  { category: 'Documentation', title: 'API documentation updated',            required: false, order: 3 },
  { category: 'Documentation', title: 'Internal runbook updated',             required: false, order: 4 },

  // Security
  { category: 'Security', title: 'Security review complete',                  required: true,  order: 1 },
  { category: 'Security', title: 'Dependencies scanned for vulnerabilities',  required: true,  order: 2 },
  { category: 'Security', title: 'Auth/authorization changes reviewed',       required: false, order: 3 },

  // Operations
  { category: 'Operations', title: 'Database migrations tested with rollback plan', required: true, order: 1 },
  { category: 'Operations', title: 'Monitoring and alerting verified',        required: true,  order: 2 },
  { category: 'Operations', title: 'Feature flags configured for rollout',    required: false, order: 3 },
  { category: 'Operations', title: 'Rollback procedure documented',           required: true,  order: 4 },

  // Sign-off
  { category: 'Sign-off', title: 'Engineering lead sign-off',                 required: true,  order: 1 },
  { category: 'Sign-off', title: 'QE lead sign-off',                         required: true,  order: 2 },
  { category: 'Sign-off', title: 'Product sign-off',                         required: true,  order: 3 },
]
