import Link from 'next/link'
import { createRelease } from '@/lib/actions'
import { DEFAULT_CHECKLIST, CATEGORIES } from '@/lib/checklist'

export default function NewReleasePage() {
  const countByCategory = CATEGORIES.map((cat) => ({
    name: cat,
    count: DEFAULT_CHECKLIST.filter((i) => i.category === cat).length,
  }))

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← All releases
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">New Release</h1>

      <form action={createRelease} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Checkout API"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1.5">
            Version <span className="text-red-500">*</span>
          </label>
          <input
            id="version"
            name="version"
            type="text"
            required
            placeholder="e.g. v2.1.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1.5">
            Target Date <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Create Release
        </button>
      </form>

      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Checklist included ({DEFAULT_CHECKLIST.length} items)
        </p>
        <div className="space-y-1.5">
          {countByCategory.map(({ name, count }) => (
            <div key={name} className="flex justify-between text-sm">
              <span className="text-gray-700">{name}</span>
              <span className="text-gray-500">{count} items</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
