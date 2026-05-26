import { connectDB, Article } from './_db.js'

export default async function handler(req, res) {
  try { await connectDB() } catch (e) {
    return res.status(500).json({ error: 'DB connection failed: ' + e.message })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    const { page = '1', limit = '12', category, q } = req.query
    const filter = { status: 'published' }

    if (category && category !== 'all') filter.category = category
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ title: re }, { subtitle: re }, { category: re }]
    }

    const [articles, total, categories] = await Promise.all([
      Article.find(filter, '-blocks -__v')
        .sort({ date: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      Article.countDocuments(filter),
      Article.distinct('category', { status: 'published' }),
    ])
    return res.json({ articles, total, page: +page, categories })
  }

  if (req.method === 'POST') {
    if (req.headers['x-api-key'] !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
      const body = req.body
      const art = await Article.findOneAndUpdate(
        { id: body.id },
        { ...body, updatedAt: new Date() },
        { upsert: true, new: true }
      )
      return res.json({ ok: true, id: art.id })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
