'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ReleaseStatus } from '@/app/generated/prisma/enums'

// ─── Release actions ────────────────────────────────────────────────────────

/**
 * Creates a new release by copying checklist items from the selected template.
 * Item order is encoded as categoryOrder × 1000 + itemOrder so a single
 * ascending sort preserves the template's category sequence.
 */
export async function createRelease(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const version = (formData.get('version') as string)?.trim()
  const targetDate = formData.get('targetDate') as string
  const templateId = formData.get('templateId') as string

  if (!name || !version) throw new Error('Product name and version are required')
  if (!templateId) throw new Error('A checklist template is required')

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!template) throw new Error('Template not found')

  const release = await prisma.release.create({
    data: {
      name,
      version,
      templateId,
      targetDate: targetDate ? new Date(targetDate) : null,
      items: {
        create: template.categories.flatMap((category) =>
          category.items.map((item) => ({
            category: category.name,
            title: item.title,
            description: item.description ?? null,
            required: item.required,
            order: category.order * 1000 + item.order,
          }))
        ),
      },
    },
  })

  redirect(`/releases/${release.id}`)
}

/** Toggles a checklist item's completed state and records the completion timestamp. */
export async function toggleItem(itemId: string, releaseId: string, completed: boolean) {
  await prisma.releaseItem.update({
    where: { id: itemId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  })
  revalidatePath(`/releases/${releaseId}`)
  revalidatePath('/')
}

/** Sets the release status (IN_PROGRESS, BLOCKED, or RELEASED). */
export async function updateReleaseStatus(releaseId: string, status: ReleaseStatus) {
  await prisma.release.update({
    where: { id: releaseId },
    data: { status },
  })
  revalidatePath(`/releases/${releaseId}`)
  revalidatePath('/')
}

// ─── Template actions ────────────────────────────────────────────────────────

/** Creates a new empty template and redirects to its detail page. */
export async function createTemplate(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Template name is required')

  const template = await prisma.template.create({ data: { name } })
  redirect(`/templates/${template.id}`)
}

/** Renames a template. */
export async function updateTemplateName(templateId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Template name is required')

  await prisma.template.update({ where: { id: templateId }, data: { name } })
  revalidatePath(`/templates/${templateId}`)
  revalidatePath('/templates')
}

/**
 * Marks a template as the default. Clears isDefault on all others first.
 * Only one template should be the default at a time.
 */
export async function setDefaultTemplate(templateId: string) {
  await prisma.$transaction([
    prisma.template.updateMany({ where: { isDefault: true }, data: { isDefault: false } }),
    prisma.template.update({ where: { id: templateId }, data: { isDefault: true } }),
  ])
  revalidatePath('/templates')
  revalidatePath(`/templates/${templateId}`)
}

/** Deletes a template. Releases that used it retain their copied items; their templateId is set to null. */
export async function deleteTemplate(templateId: string) {
  await prisma.template.delete({ where: { id: templateId } })
  redirect('/templates')
}

/** Adds a new category to a template. Order is set to max existing + 1. */
export async function createTemplateCategory(templateId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Category name is required')

  const aggregate = await prisma.templateCategory.aggregate({
    where: { templateId },
    _max: { order: true },
  })
  const nextOrder = (aggregate._max.order ?? -1) + 1

  await prisma.templateCategory.create({
    data: { templateId, name, order: nextOrder },
  })
  revalidatePath(`/templates/${templateId}`)
}

/** Renames a template category. */
export async function updateTemplateCategoryName(
  categoryId: string,
  templateId: string,
  formData: FormData
) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Category name is required')

  await prisma.templateCategory.update({ where: { id: categoryId }, data: { name } })
  revalidatePath(`/templates/${templateId}`)
}

/** Deletes a template category and all its items. */
export async function deleteTemplateCategory(categoryId: string, templateId: string) {
  await prisma.templateCategory.delete({ where: { id: categoryId } })
  revalidatePath(`/templates/${templateId}`)
}

/** Adds a checklist item to a template category. Order is set to max existing + 1. */
export async function createTemplateItem(
  categoryId: string,
  templateId: string,
  formData: FormData
) {
  const title = (formData.get('title') as string)?.trim()
  const required = formData.get('required') === 'true'
  if (!title) throw new Error('Item title is required')

  const aggregate = await prisma.templateItem.aggregate({
    where: { categoryId },
    _max: { order: true },
  })
  const nextOrder = (aggregate._max.order ?? -1) + 1

  await prisma.templateItem.create({
    data: { categoryId, title, required, order: nextOrder },
  })
  revalidatePath(`/templates/${templateId}`)
}

/** Toggles a template item between required and optional. */
export async function updateTemplateItemRequired(
  itemId: string,
  templateId: string,
  required: boolean
) {
  await prisma.templateItem.update({ where: { id: itemId }, data: { required } })
  revalidatePath(`/templates/${templateId}`)
}

/** Deletes a template item. */
export async function deleteTemplateItem(itemId: string, templateId: string) {
  await prisma.templateItem.delete({ where: { id: itemId } })
  revalidatePath(`/templates/${templateId}`)
}

// ─── Feature tracking actions ────────────────────────────────────────────────

/** Adds a named feature to a release. Order is set to max existing + 1. */
export async function addFeature(releaseId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Feature name is required')

  const aggregate = await prisma.feature.aggregate({
    where: { releaseId },
    _max: { order: true },
  })
  const nextOrder = (aggregate._max.order ?? -1) + 1

  await prisma.feature.create({ data: { releaseId, name, order: nextOrder } })
  revalidatePath(`/releases/${releaseId}`)
}

/** Toggles the code-complete state for a release feature. */
export async function toggleFeatureCodeComplete(
  featureId: string,
  releaseId: string,
  codeComplete: boolean
) {
  await prisma.feature.update({ where: { id: featureId }, data: { codeComplete } })
  revalidatePath(`/releases/${releaseId}`)
  revalidatePath('/')
}

/** Removes a feature from a release. */
export async function deleteFeature(featureId: string, releaseId: string) {
  await prisma.feature.delete({ where: { id: featureId } })
  revalidatePath(`/releases/${releaseId}`)
  revalidatePath('/')
}

/** Toggles a release-level readiness gate (codeFreezeConfirmed or noUnplannedFeatures). */
export async function toggleReleaseGate(
  releaseId: string,
  field: 'codeFreezeConfirmed' | 'noUnplannedFeatures',
  value: boolean
) {
  await prisma.release.update({ where: { id: releaseId }, data: { [field]: value } })
  revalidatePath(`/releases/${releaseId}`)
  revalidatePath('/')
}
