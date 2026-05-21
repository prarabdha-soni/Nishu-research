// One-time migration: pushes existing articles into MongoDB
// Usage: node scripts/migrate.js

import { readFileSync } from 'fs'

// Must load env BEFORE any db import (static imports are hoisted, so use dynamic import below)
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=')
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  })
} catch {}

// Dynamic imports run after env is set
const { connectDB, Article } = await import('../lib/db.js')
const { articles: hardcoded } = await import('../src/data/articles.js')

let jsonPublished = []
try {
  const raw = readFileSync('./src/data/published.json', 'utf8')
  jsonPublished = JSON.parse(raw)
} catch {}

async function migrate() {
  await connectDB()
  console.log('Connected to MongoDB\n')

  const all = [...hardcoded, ...jsonPublished]
  if (all.length === 0) { console.log('No articles to migrate.'); process.exit(0) }

  for (const art of all) {
    await Article.findOneAndUpdate(
      { id: art.id },
      { ...art, status: art.status || 'published' },
      { upsert: true, new: true }
    )
    console.log(`✓ ${art.title}`)
  }

  console.log(`\nDone — migrated ${all.length} article(s)`)
  process.exit(0)
}

migrate().catch(e => { console.error(e); process.exit(1) })
