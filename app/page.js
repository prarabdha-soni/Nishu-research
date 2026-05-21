import { connectDB, Article } from '@/lib/db'
import GlowwHomepage from '@/components/GlowwHomepage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Gloww — Future Research Lab | The Future Is The Biggest Multibagger',
  description: 'Independent long-horizon research on AI, telecom, emerging markets, gold, and civilizational change. Studying structural shifts before markets understand them.',
}

export default async function HomePage() {
  await connectDB()

  const articles = await Article.find(
    { status: 'published' },
    '-blocks -__v'
  ).sort({ date: -1 }).limit(12).lean()

  return <GlowwHomepage articles={JSON.parse(JSON.stringify(articles))} />
}
