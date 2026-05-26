import { NextResponse } from 'next/server'
import { connectDB, Article } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const article = await Article.findOne({ id: params.id }).lean()
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(article)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

const FALLBACK_KEY = 'bharatpulse'

function isAdmin(request) {
  const validKey = process.env.ADMIN_API_KEY || FALLBACK_KEY
  return request.headers.get('x-api-key') === validKey
}

export async function PUT(request, { params }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const body = await request.json()
    const art = await Article.findOneAndUpdate({ id: params.id }, { ...body, updatedAt: new Date() }, { new: true })
    if (!art) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, id: art.id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    await Article.deleteOne({ id: params.id })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
