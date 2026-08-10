'use client'

import { useTransition } from 'react'
import { toggleItem } from '@/lib/actions'

type Props = {
  item: {
    id: string
    releaseId: string
    title: string
    required: boolean
    completed: boolean
  }
}

export function ChecklistItem({ item }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <label className={`flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(e) => {
          startTransition(() => {
            toggleItem(item.id, item.releaseId, e.target.checked)
          })
        }}
        disabled={isPending}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.title}
        </span>
        {item.required && !item.completed && (
          <span className="text-xs text-red-500 font-medium">Required</span>
        )}
      </div>
    </label>
  )
}
