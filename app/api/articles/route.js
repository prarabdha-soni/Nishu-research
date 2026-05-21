import { NextResponse } from 'next/server'
import { connectDB, Article } from '@/lib/db'

export async function GET(request) {
  try {
    await connectDB()
  } catch (e) {
    return NextResponse.json({ error: 'DB error: ' + e.message }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const page  = +(searchParams.get('page')  || 1)
  const limit = +(searchParams.get('limit') || 12)
  const category = searchParams.get('category')
  const q        = searchParams.get('q')
  const status   = searchParams.get('status') || 'published'

  const filter = { status }
  if (category && category !== 'all') filter.category = category
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ title: re }, { subtitle: re }, { category: re }]
  }

  const [articles, total, categories] = await Promise.all([
    Article.find(filter, '-blocks -__v').sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Article.countDocuments(filter),
    Article.distinct('category', { status: 'published' }),
  ])

  return NextResponse.json({ articles, total, page, categories })
}

export async function POST(request) {
  if (request.headers.get('x-api-key') !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await connectDB()
    const body = await request.json()
    const art = await Article.findOneAndUpdate(
      { id: body.id },
      { ...body, updatedAt: new Date() },
      { upsert: true, new: true }
    )
    return NextResponse.json({ ok: true, id: art.id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
