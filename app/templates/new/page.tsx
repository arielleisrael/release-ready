import Link from 'next/link'
import { createTemplate } from '@/lib/actions'

/** Form to create a new empty template. After submission, redirects to the template detail page to add categories and items. */
export default function NewTemplatePage() {
  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/templates" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Templates
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-2">New Template</h1>
      <p className="text-sm text-gray-500 mb-6">
        Give your template a name, then add categories and checklist items on the next page.
      </p>

      <form action={createTemplate} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Mobile Release Checklist"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Create Template
        </button>
      </form>
    </div>
  )
}
