'use client'
import GlowNav from './GlowNav'
import HeroSection from './HeroSection'
import FeaturedResearch from './FeaturedResearch'
import ThemesBento from './ThemesBento'
import GlowTimeline from './GlowTimeline'
import SignalBlocks from './SignalBlocks'
import ResearchFeed from './ResearchFeed'
import GlowNewsletter from './GlowNewsletter'
import GlowFooter from './GlowFooter'

export default function GlowwHomepage({ articles }) {
  return (
    <div className="bg-g-bg min-h-screen text-g-text font-sans antialiased">
      <GlowNav />
      <HeroSection />
      <FeaturedResearch articles={articles} />
      <ThemesBento />
      <GlowTimeline />
      <SignalBlocks />
      <ResearchFeed articles={articles} />
      <GlowNewsletter />
      <GlowFooter />
    </div>
  )
}
