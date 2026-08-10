'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { DEFAULT_CHECKLIST } from '@/lib/checklist'
import { ReleaseStatus } from '@/app/generated/prisma/enums'

export async function createRelease(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const version = (formData.get('version') as string)?.trim()
  const targetDate = formData.get('targetDate') as string

  if (!name || !version) throw new Error('Product name and version are required')

  const release = await prisma.release.create({
    data: {
      name,
      version,
      targetDate: targetDate ? new Date(targetDate) : null,
      items: {
        create: DEFAULT_CHECKLIST.map((item) => ({
          category: item.category,
          title: item.title,
          description: item.description ?? null,
          required: item.required,
          order: item.order,
        })),
      },
    },
  })

  redirect(`/releases/${release.id}`)
}

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

export async function updateReleaseStatus(releaseId: string, status: ReleaseStatus) {
  await prisma.release.update({
    where: { id: releaseId },
    data: { status },
  })
  revalidatePath(`/releases/${releaseId}`)
  revalidatePath('/')
}
