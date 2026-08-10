'use client'

import { useTransition, useState } from 'react'
import {
  addFeature,
  toggleFeatureCodeComplete,
  deleteFeature,
  toggleReleaseGate,
} from '@/lib/actions'

type Feature = { id: string; name: string; codeComplete: boolean }

type Props = {
  releaseId: string
  features: Feature[]
  codeFreezeConfirmed: boolean
  noUnplannedFeatures: boolean
}

/**
 * Client component for the Feature Tracking section of the release detail page.
 * Manages planned features, code-complete state, and release-level readiness gates.
 */
export function FeatureSection({ releaseId, features, codeFreezeConfirmed, noUnplannedFeatures }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [addKey, setAddKey] = useState(0)

  const completedCount = features.filter((f) => f.codeComplete).length

  function handleToggleCodeComplete(featureId: string, current: boolean) {
    startTransition(() => toggleFeatureCodeComplete(featureId, releaseId, !current))
  }

  function handleDeleteFeature(featureId: string) {
    startTransition(() => deleteFeature(featureId, releaseId))
  }

  function handleToggleGate(field: 'codeFreezeConfirmed' | 'noUnplannedFeatures', current: boolean) {
    startTransition(() => toggleReleaseGate(releaseId, field, !current))
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 ${isPending ? 'opacity-70' : ''}`}>
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-semibold text-gray-700">Feature Tracking</span>
        {features.length > 0 && (
          <span className="text-sm text-gray-400 tabular-nums">
            {completedCount}/{features.length} code complete
          </span>
        )}
      </div>

      {/* Planned features */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Planned Features
        </p>
      </div>

      {features.length === 0 && !showAddForm && (
        <p className="px-4 pb-3 text-sm text-gray-400">No features added yet.</p>
      )}

      {features.length > 0 && (
        <div className="divide-y divide-gray-50 border-t border-gray-50">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center gap-3 px-4 py-2.5">
              <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feature.codeComplete}
                  onChange={() => handleToggleCodeComplete(feature.id, feature.codeComplete)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                  aria-label={`Mark "${feature.name}" code complete`}
                />
                <span className={`text-sm ${feature.codeComplete ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {feature.name}
                </span>
              </label>
              {feature.codeComplete && (
                <span className="text-xs text-emerald-600 font-medium shrink-0">Code Complete</span>
              )}
              <button
                onClick={() => handleDeleteFeature(feature.id)}
                disabled={isPending}
                className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0"
                aria-label={`Remove feature "${feature.name}"`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add feature form */}
      {showAddForm ? (
        <form
          key={addKey}
          action={(formData) => {
            startTransition(async () => {
              await addFeature(releaseId, formData)
              setAddKey((k) => k + 1)
            })
          }}
          className="px-4 py-3 border-t border-gray-100 flex gap-2"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Feature name (e.g. User Authentication)"
            autoFocus
            className="flex-1 min-w-0 text-sm border border-gray-300 rounded-lg px-3 py-1.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isPending}
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Done
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-50"
        >
          + Add feature
        </button>
      )}

      {/* Release-level gates (always required) */}
      <div className="border-t border-gray-100 px-4 pt-3 pb-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Release Gates <span className="text-red-400 font-normal">Required</span>
        </p>
      </div>
      <div className="divide-y divide-gray-50 border-t border-gray-50">
        <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={codeFreezeConfirmed}
            onChange={() => handleToggleGate('codeFreezeConfirmed', codeFreezeConfirmed)}
            disabled={isPending}
            className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
          />
          <span className={`text-sm ${codeFreezeConfirmed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            Code Freeze
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            No new code merging outside of planned defect fixes
          </span>
        </label>
        <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={noUnplannedFeatures}
            onChange={() => handleToggleGate('noUnplannedFeatures', noUnplannedFeatures)}
            disabled={isPending}
            className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
          />
          <span className={`text-sm ${noUnplannedFeatures ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            No Unplanned Features
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            Only listed features and logged defects in scope
          </span>
        </label>
      </div>
      <div className="h-3" />
    </div>
  )
}
