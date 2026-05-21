import { connectDB, Article } from '@/lib/db'
import HomepageShell from '@/components/HomepageShell'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  await connectDB()

  const [articles, total, categories] = await Promise.all([
    Article.find({ status: 'published' }, '-blocks -__v').sort({ date: -1 }).limit(12).lean(),
    Article.countDocuments({ status: 'published' }),
    Article.distinct('category', { status: 'published' }),
  ])

  // Mongoose lean() returns plain objects but _id is still an ObjectId; serialize it
  const serialized = JSON.parse(JSON.stringify(articles))

  return (
    <HomepageShell
      initialArticles={serialized}
      initialTotal={total}
      initialCategories={categories.filter(Boolean).sort()}
    />
  )
}
