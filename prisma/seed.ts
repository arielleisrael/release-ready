import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

/** The default checklist template seeded on first run. Mirrors the original hardcoded DEFAULT_CHECKLIST. */
const DEFAULT_TEMPLATE = {
  name: 'Standard Release Checklist',
  isDefault: true,
  categories: [
    {
      name: 'Testing',
      order: 0,
      items: [
        { title: 'All automated tests passing in CI', required: true, order: 0 },
        { title: 'Manual regression testing complete', required: true, order: 1 },
        { title: 'New features have test coverage', required: true, order: 2 },
        { title: 'Performance benchmarks within acceptable range', required: false, order: 3 },
        { title: 'Accessibility review complete', required: false, order: 4 },
      ],
    },
    {
      name: 'Documentation',
      order: 1,
      items: [
        { title: 'User-facing documentation updated', required: true, order: 0 },
        { title: 'Release notes drafted', required: true, order: 1 },
        { title: 'API documentation updated', required: false, order: 2 },
        { title: 'Internal runbook updated', required: false, order: 3 },
      ],
    },
    {
      name: 'Security',
      order: 2,
      items: [
        { title: 'Security review complete', required: true, order: 0 },
        { title: 'Dependencies scanned for vulnerabilities', required: true, order: 1 },
        { title: 'Auth/authorization changes reviewed', required: false, order: 2 },
      ],
    },
    {
      name: 'Operations',
      order: 3,
      items: [
        { title: 'Database migrations tested with rollback plan', required: true, order: 0 },
        { title: 'Monitoring and alerting verified', required: true, order: 1 },
        { title: 'Feature flags configured for rollout', required: false, order: 2 },
        { title: 'Rollback procedure documented', required: true, order: 3 },
      ],
    },
    {
      name: 'Sign-off',
      order: 4,
      items: [
        { title: 'Engineering lead sign-off', required: true, order: 0 },
        { title: 'QE lead sign-off', required: true, order: 1 },
        { title: 'Product sign-off', required: true, order: 2 },
      ],
    },
  ],
}

async function seed() {
  const existingCount = await prisma.template.count()
  if (existingCount > 0) {
    console.log(`Skipping seed — ${existingCount} template(s) already exist.`)
    return
  }

  const template = await prisma.template.create({
    data: {
      name: DEFAULT_TEMPLATE.name,
      isDefault: DEFAULT_TEMPLATE.isDefault,
      categories: {
        create: DEFAULT_TEMPLATE.categories.map((cat) => ({
          name: cat.name,
          order: cat.order,
          items: { create: cat.items },
        })),
      },
    },
  })

  console.log(`Created default template: "${template.name}" (${template.id})`)
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
