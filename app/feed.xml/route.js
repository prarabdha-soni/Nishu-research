import { connectDB, Article } from '@/lib/db'
import { SITE_NAME, SITE_URL } from '@/lib/config'

export const dynamic = 'force-dynamic'

function xmlEsc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function excerpt(blocks) {
  for (const b of (blocks || [])) {
    if (b.type === 'paragraph' && b.text?.trim()) {
      const sents = b.text.match(/[^.!?]+[.!?]+/g) || [b.text]
      return sents.slice(0, 2).join(' ').trim()
    }
  }
  return ''
}

export async function GET() {
  await connectDB()
  const articles = await Article.find(
    { status: 'published' },
    'id title subtitle author date blocks'
  ).sort({ date: -1 }).limit(20).lean()

  const items = articles.map(a => {
    const link = `${SITE_URL}/article/${a.id}`
    const desc  = a.subtitle || excerpt(a.blocks)
    return `
    <item>
      <title>${xmlEsc(a.title)}</title>
      <link>${xmlEsc(link)}</link>
      <description>${xmlEsc(desc)}</description>
      <author>${xmlEsc(a.author)}</author>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${xmlEsc(link)}</guid>
    </item>`
  }).join('')

  const feedUrl = `${SITE_URL}/feed.xml`
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEsc(SITE_NAME)} — Independent Research</title>
    <link>${xmlEsc(SITE_URL)}</link>
    <description>Long-horizon, data-driven investment research on India and emerging markets.</description>
    <language>en-in</language>
    <ttl>60</ttl>
    <atom:link href="${xmlEsc(feedUrl)}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
