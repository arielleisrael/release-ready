import Link from 'next/link'
import { prisma } from '@/lib/db'
import { NewReleaseForm } from './NewReleaseForm'

/** Fetches available templates and renders the new-release form. */
export default async function NewReleasePage() {
  const templates = await prisma.template.findMany({
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' }, select: { required: true } } },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← All releases
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">New Release</h1>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500 mb-4">
            You need at least one checklist template before creating a release.
          </p>
          <Link
            href="/templates/new"
            className="inline-flex items-center bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Create a Template
          </Link>
        </div>
      ) : (
        <NewReleaseForm templates={templates} />
      )}
    </div>
  )
}
