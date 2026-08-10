import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { updateTemplateName, setDefaultTemplate, deleteTemplate } from '@/lib/actions'
import { TemplateCategoryManager } from './TemplateCategoryManager'

/** Template detail page: rename, manage categories and items, set as default. */
export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!template) notFound()

  const totalItems = template.categories.reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <div>
      <div className="mb-6">
        <Link href="/templates" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Templates
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-semibold text-gray-900">{template.name}</h1>
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

          <div className="flex items-center gap-2 flex-wrap">
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
                Delete Template
              </button>
            </form>
          </div>
        </div>

        {/* Rename form */}
        <form
          action={updateTemplateName.bind(null, template.id)}
          className="mt-4 pt-4 border-t border-gray-100 flex gap-2"
        >
          <input
            name="name"
            type="text"
            defaultValue={template.name}
            required
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            className="text-sm text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Rename
          </button>
        </form>
      </div>

      {/* Categories and items */}
      <TemplateCategoryManager
        templateId={template.id}
        categories={template.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          items: cat.items.map((item) => ({
            id: item.id,
            title: item.title,
            required: item.required,
            order: item.order,
          })),
        }))}
      />
    </div>
  )
}
