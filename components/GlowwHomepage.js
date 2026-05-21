'use client'
import GlowNav from './GlowNav'
import HeroSection from './HeroSection'
import ResearchFeed from './ResearchFeed'
import GlowFooter from './GlowFooter'

export default function GlowwHomepage({ articles }) {
  return (
    <div className="bg-g-bg min-h-screen text-g-text font-sans antialiased">
      <GlowNav />
      <HeroSection />
      <ResearchFeed articles={articles} />
      <GlowFooter />
    </div>
  )
}
