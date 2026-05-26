import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-10">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-700">
          <div>
            <Link href="/" className="font-black text-[17px] text-white tracking-tight">
              Bharat<span style={{ color: '#CC785C' }}>.</span>Pulse
            </Link>
            <p className="text-gray-500 text-[12px] mt-1 font-medium uppercase tracking-widest">
              Independent Research
            </p>
          </div>
          <nav className="flex items-center gap-6 text-[13px] font-semibold uppercase tracking-wide">
            <Link href="/pipeline" className="hover:text-white transition-colors">Pipeline</Link>
            <Link href="/feed.xml" className="hover:text-white transition-colors">RSS</Link>
            <a href="mailto:research@bharatpulse.in" className="hover:text-white transition-colors">Contact</a>
          </nav>
        </div>
        <p className="text-gray-600 text-[12px] mt-5 italic">
          &ldquo;The Future Is The Biggest Multibagger.&rdquo;
        </p>
      </div>
    </footer>
  )
}
