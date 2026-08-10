import Link from 'next/link'
import { prisma } from '@/lib/db'
import { setDefaultTemplate, deleteTemplate } from '@/lib/actions'

/** Lists all checklist templates with item counts and management actions. */
export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    include: {
      categories: {
        include: { _count: { select: { items: true } } },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Checklist Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Templates define the categories and items copied into each new release.
          </p>
        </div>
        <Link
          href="/templates/new"
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h2>
          <p className="text-sm text-gray-500 mb-6">
            Create a template to define the checklist for your releases.
          </p>
          <Link
            href="/templates/new"
            className="inline-flex items-center bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + New Template
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => {
            const totalItems = template.categories.reduce(
              (sum, cat) => sum + cat._count.items,
              0
            )
            return (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link
                      href={`/templates/${template.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {template.name}
                    </Link>
                    {template.isDefault && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {template.categories.length} categories · {totalItems} items
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Link
                    href={`/templates/${template.id}`}
                    className="text-xs text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </Link>
                  {!template.isDefault && (
                    <form action={setDefaultTemplate.bind(null, template.id)}>
                      <button
                        type="submit"
                        className="text-xs text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Set as Default
                      </button>
                    </form>
                  )}
                  <form action={deleteTemplate.bind(null, template.id)}>
                    <button
                      type="submit"
                      className="text-xs text-red-500 border border-red-100 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
