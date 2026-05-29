/**
 * Delete all articles EXCEPT those matching "airtel" or "polycab" in the title/id.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/delete-articles.js
 *
 * Or paste your real URI into .env.local and run:
 *   node -r dotenv/config scripts/delete-articles.js dotenv_config_path=.env.local
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌  Set MONGODB_URI env var first.')
  process.exit(1)
}

const articleSchema = new mongoose.Schema({
  id:       { type: String, unique: true, index: true },
  title:    String,
  status:   { type: String, default: 'published' },
}, { strict: false })

const Article = mongoose.models.Article ?? mongoose.model('Article', articleSchema)

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false })
  console.log('✅  Connected to MongoDB')

  const all = await Article.find({}, 'id title').lean()
  console.log(`\nFound ${all.length} articles:\n`)
  all.forEach(a => console.log(` • [${a.id}]  ${a.title}`))

  const KEEP = ['airtel', 'polycab']
  const toDelete = all.filter(a => {
    const haystack = `${a.id} ${a.title}`.toLowerCase()
    return !KEEP.some(k => haystack.includes(k))
  })

  const toKeep = all.filter(a => {
    const haystack = `${a.id} ${a.title}`.toLowerCase()
    return KEEP.some(k => haystack.includes(k))
  })

  console.log(`\n🟢 Keeping ${toKeep.length}:`)
  toKeep.forEach(a => console.log(`   ✓ ${a.title}`))

  console.log(`\n🔴 Deleting ${toDelete.length}:`)
  toDelete.forEach(a => console.log(`   ✗ ${a.title}`))

  if (toDelete.length === 0) {
    console.log('\nNothing to delete.')
    await mongoose.disconnect()
    return
  }

  const ids = toDelete.map(a => a.id)
  const result = await Article.deleteMany({ id: { $in: ids } })
  console.log(`\n✅  Deleted ${result.deletedCount} articles.`)

  await mongoose.disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })
