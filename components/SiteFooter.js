import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-[15px] tracking-[-0.02em] text-stone-900">
            Bharat<span className="text-[#CC785C]">.</span>Pulse
          </Link>
          <span className="text-stone-300 hidden sm:block">·</span>
          <Link href="/pipeline" className="text-stone-400 hover:text-stone-700 text-sm transition-colors duration-150">
            Pipeline
          </Link>
          <Link href="/feed.xml" className="text-stone-400 hover:text-stone-700 text-sm transition-colors duration-150">
            RSS
          </Link>
        </div>
        <p className="text-stone-400 text-[13px] italic">
          &ldquo;The Future Is The Biggest Multibagger.&rdquo;
        </p>
      </div>
    </footer>
  )
}
