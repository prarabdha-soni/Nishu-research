import { connectDB, Article } from '../_db.js'

export default async function handler(req, res) {
  try { await connectDB() } catch (e) {
    return res.status(500).json({ error: 'DB connection failed: ' + e.message })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const { id } = req.query

  if (req.method === 'GET') {
    const article = await Article.findOne({ id }).lean()
    if (!article) return res.status(404).json({ error: 'Not found' })
    return res.json(article)
  }

  if (req.headers['x-api-key'] !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'DELETE') {
    await Article.deleteOne({ id })
    return res.json({ ok: true })
  }

  if (req.method === 'PUT') {
    const art = await Article.findOneAndUpdate(
      { id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    if (!art) return res.status(404).json({ error: 'Not found' })
    return res.json({ ok: true, id: art.id })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
