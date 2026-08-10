'use client'

import { useTransition, useState } from 'react'
import {
  createTemplateCategory,
  updateTemplateCategoryName,
  deleteTemplateCategory,
  createTemplateItem,
  updateTemplateItemRequired,
  deleteTemplateItem,
} from '@/lib/actions'

type TemplateItem = { id: string; title: string; required: boolean; order: number }
type Category = { id: string; name: string; items: TemplateItem[] }

type Props = {
  templateId: string
  categories: Category[]
}

/**
 * Client component for managing template categories and items inline.
 * All mutations go through server actions; the server component re-renders
 * on revalidatePath to reflect the updated template.
 */
export function TemplateCategoryManager({ templateId, categories }: Props) {
  const [isPending, startTransition] = useTransition()

  // Which category's "Add item" form is open
  const [addItemCategoryId, setAddItemCategoryId] = useState<string | null>(null)
  // Key incremented after each item add to reset the form inputs
  const [addItemKey, setAddItemKey] = useState(0)

  // Which category is in rename mode
  const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(null)

  // Whether the "Add category" form is visible
  const [showAddCategory, setShowAddCategory] = useState(false)

  function handleDeleteCategory(categoryId: string) {
    startTransition(() => deleteTemplateCategory(categoryId, templateId))
  }

  function handleDeleteItem(itemId: string) {
    startTransition(() => deleteTemplateItem(itemId, templateId))
  }

  function handleToggleRequired(itemId: string, currentRequired: boolean) {
    startTransition(() => updateTemplateItemRequired(itemId, templateId, !currentRequired))
  }

  return (
    <div className={`space-y-4 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {categories.map((category) => (
        <div key={category.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Category header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
            {renamingCategoryId === category.id ? (
              <form
                action={(formData) => {
                  startTransition(async () => {
                    await updateTemplateCategoryName(category.id, templateId, formData)
                    setRenamingCategoryId(null)
                  })
                }}
                className="flex items-center gap-2 flex-1"
              >
                <input
                  name="name"
                  type="text"
                  defaultValue={category.name}
                  required
                  autoFocus
                  className="flex-1 text-sm font-semibold border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="submit"
                  className="text-xs text-gray-700 border border-gray-300 bg-white px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setRenamingCategoryId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">{category.name}</span>
                  <span className="text-xs text-gray-400">{category.items.length} items</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRenamingCategoryId(category.id)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`Delete ${category.name} category`}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Items list */}
          {category.items.length > 0 && (
            <div className="divide-y divide-gray-50">
              {category.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="flex-1 text-sm text-gray-800">{item.title}</span>
                  <button
                    onClick={() => handleToggleRequired(item.id, item.required)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      item.required
                        ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                        : 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100'
                    }`}
                    aria-label={`Mark "${item.title}" as ${item.required ? 'optional' : 'required'}`}
                  >
                    {item.required ? 'Required' : 'Optional'}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
                    aria-label={`Delete "${item.title}"`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add item */}
          {addItemCategoryId === category.id ? (
            <form
              key={addItemKey}
              action={(formData) => {
                startTransition(async () => {
                  await createTemplateItem(category.id, templateId, formData)
                  // Increment key to reset the form inputs while keeping the form open
                  setAddItemKey((k) => k + 1)
                })
              }}
              className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-wrap"
            >
              <input
                name="title"
                type="text"
                required
                placeholder="Item title"
                autoFocus
                className="flex-1 min-w-0 text-sm border border-gray-300 rounded-lg px-3 py-1.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <select
                name="required"
                defaultValue="true"
                className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="true">Required</option>
                <option value="false">Optional</option>
              </select>
              <button
                type="submit"
                className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddItemCategoryId(null)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Done
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddItemCategoryId(category.id)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              + Add item
            </button>
          )}
        </div>
      ))}

      {/* Add category */}
      {showAddCategory ? (
        <form
          action={(formData) => {
            startTransition(async () => {
              await createTemplateCategory(templateId, formData)
              setShowAddCategory(false)
            })
          }}
          className="bg-white border border-gray-200 rounded-xl p-4 flex gap-2"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Category name (e.g. Security)"
            autoFocus
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Add Category
          </button>
          <button
            type="button"
            onClick={() => setShowAddCategory(false)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddCategory(true)}
          className="w-full text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-500 rounded-xl py-3 transition-colors"
        >
          + Add Category
        </button>
      )}
    </div>
  )
}
