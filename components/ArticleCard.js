import Link from 'next/link'
import { formatDate } from '@/lib/renderer'

export default function ArticleCard({ article: a, featured }) {
  const hasImage = Boolean(a.coverImage)
  return (
    <Link
      className={`art-card${featured ? ' art-card--featured' : ''}`}
      href={`/article/${a.id}`}
    >
      <div
        className={`art-card-img${hasImage ? '' : ' art-card-img--placeholder'}`}
        style={hasImage ? { backgroundImage: `url(${a.coverImage})` } : undefined}
      />
      <div className="art-card-top">
        <span className="art-cat">{a.category || ''}</span>
        <span className="art-issue">No.&thinsp;{String(a.issue).padStart(2, '0')}</span>
      </div>
      <h2 className="art-title">{a.title}</h2>
      <p className="art-sub">{a.subtitle}</p>
      <div className="art-footer">
        <span className="art-author">{a.author}</span>
        <span className="art-sep">&middot;</span>
        <span>{formatDate(a.date)}</span>
        <span className="art-sep">&middot;</span>
        <span>{a.readTime} min read</span>
      </div>
    </Link>
  )
}
