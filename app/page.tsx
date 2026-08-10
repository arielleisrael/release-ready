import Link from 'next/link'
import { prisma } from '@/lib/db'
import { calculateReadiness, formatDate, scoreColor } from '@/lib/utils'

export default async function HomePage() {
  const releases = await prisma.release.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Releases</h1>
        {releases.length > 0 && (
          <span className="text-sm text-gray-500">{releases.length} release{releases.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">No releases yet</h2>
          <p className="text-sm text-gray-500 mb-6">Create your first release to start tracking readiness.</p>
          <Link
            href="/releases/new"
            className="inline-flex items-center bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + New Release
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {releases.map((release) => {
            const { score, isGo, completedTotal } = calculateReadiness(release.items)
            const targetDate = formatDate(release.targetDate)

            return (
              <Link
                key={release.id}
                href={`/releases/${release.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{release.name}</span>
                      <span className="text-sm text-gray-500 font-mono">{release.version}</span>
                    </div>
                    {targetDate && (
                      <p className="text-sm text-gray-500 mt-0.5">Target: {targetDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-2xl font-bold tabular-nums ${scoreColor(score)}`}>
                      {score}%
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      release.status === 'RELEASED'   ? 'bg-gray-100 text-gray-600' :
                      release.status === 'BLOCKED'    ? 'bg-amber-100 text-amber-700' :
                      isGo                            ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-red-100 text-red-700'
                    }`}>
                      {release.status === 'RELEASED' ? 'RELEASED' :
                       release.status === 'BLOCKED'  ? 'BLOCKED' :
                       isGo                          ? 'GO' : 'NO GO'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums shrink-0">
                      {completedTotal}/{release.items.length} items
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
