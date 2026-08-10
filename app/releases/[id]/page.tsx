import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { calculateReadiness, formatDate, scoreColor } from '@/lib/utils'
import { CATEGORIES, CATEGORY_STYLES } from '@/lib/checklist'
import { ChecklistItem } from './ChecklistItem'
import { updateReleaseStatus } from '@/lib/actions'
import { ReleaseStatus } from '@/app/generated/prisma/enums'

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const release = await prisma.release.findUnique({
    where: { id },
    include: { items: { orderBy: [{ category: 'asc' }, { order: 'asc' }] } },
  })

  if (!release) notFound()

  const { score, isGo, completedTotal, completedRequired, totalRequired } = calculateReadiness(release.items)
  const targetDate = formatDate(release.targetDate)

  const statusLabel =
    release.status === 'RELEASED' ? 'Released' :
    release.status === 'BLOCKED'  ? 'Blocked' :
    isGo                          ? 'Go' : 'No Go'

  const statusStyles =
    release.status === 'RELEASED' ? 'bg-gray-100 text-gray-600' :
    release.status === 'BLOCKED'  ? 'bg-amber-100 text-amber-700' :
    isGo                          ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-red-100 text-red-700'

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← All releases
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{release.name}</h1>
              <span className="text-gray-500 font-mono text-sm">{release.version}</span>
            </div>
            {targetDate && <p className="text-sm text-gray-500 mt-1">Target: {targetDate}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold tabular-nums ${scoreColor(score)}`}>{score}%</span>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${statusStyles}`}>
              {statusLabel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 tabular-nums shrink-0">
              {completedTotal}/{release.items.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedRequired}/{totalRequired} required items complete
            {isGo && release.status === 'IN_PROGRESS' && (
              <span className="ml-2 text-emerald-600 font-medium">✓ All required done</span>
            )}
          </p>
        </div>

        {/* Status actions */}
        {release.status !== 'RELEASED' && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
            {release.status !== 'BLOCKED' && (
              <form action={updateReleaseStatus.bind(null, release.id, ReleaseStatus.BLOCKED)}>
                <button type="submit" className="text-xs text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                  Mark Blocked
                </button>
              </form>
            )}
            {release.status === 'BLOCKED' && (
              <form action={updateReleaseStatus.bind(null, release.id, ReleaseStatus.IN_PROGRESS)}>
                <button type="submit" className="text-xs text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  Unblock
                </button>
              </form>
            )}
            <form action={updateReleaseStatus.bind(null, release.id, ReleaseStatus.RELEASED)}>
              <button type="submit" className="text-xs text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                Mark Released
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Checklist by category */}
      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const categoryItems = release.items.filter((i) => i.category === category)
          if (categoryItems.length === 0) return null

          const completedCount = categoryItems.filter((i) => i.completed).length
          const styles = CATEGORY_STYLES[category]

          return (
            <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 ${styles.header}`}>
                <span className="text-sm font-semibold">{category}</span>
                <span className="text-sm tabular-nums opacity-75">{completedCount}/{categoryItems.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {categoryItems.map((item) => (
                  <ChecklistItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
