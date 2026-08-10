'use client'

import { useState } from 'react'
import { createRelease } from '@/lib/actions'

type TemplateCategory = {
  name: string
  items: { required: boolean }[]
}

type Template = {
  id: string
  name: string
  isDefault: boolean
  categories: TemplateCategory[]
}

type Props = {
  templates: Template[]
}

/**
 * Client component for the new-release form.
 * Manages template selection state so the checklist preview updates dynamically.
 */
export function NewReleaseForm({ templates }: Props) {
  const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0]
  const [selectedId, setSelectedId] = useState(defaultTemplate?.id ?? '')

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0]
  const totalItems = selected?.categories.reduce((sum, cat) => sum + cat.items.length, 0) ?? 0
  const requiredCount = selected?.categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.required).length,
    0
  ) ?? 0

  return (
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

      {/* Template selector */}
      <div>
        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1.5">
          Checklist Template
        </label>
        {templates.length === 1 ? (
          <>
            <input type="hidden" name="templateId" value={templates[0].id} />
            <p className="text-sm text-gray-500">
              Using <span className="font-medium text-gray-700">{templates[0].name}</span>
              {templates[0].isDefault ? ' (Default)' : ''}
            </p>
          </>
        ) : (
          <select
            id="templateId"
            name="templateId"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.isDefault ? ' (Default)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Create Release
      </button>

      {/* Template preview */}
      {selected && (
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Checklist included ({totalItems} items · {requiredCount} required)
          </p>
          <div className="space-y-1.5">
            {selected.categories.map((cat) => (
              <div key={cat.name} className="flex justify-between text-sm">
                <span className="text-gray-700">{cat.name}</span>
                <span className="text-gray-500">
                  {cat.items.length} items ({cat.items.filter((i) => i.required).length} required)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
