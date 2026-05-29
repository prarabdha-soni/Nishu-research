import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: '#0a0a0a' }} className="text-gray-400 mt-10">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <div>
            <Link href="/" className="font-black text-[17px] text-white tracking-tight">
              Bharat<span style={{ color: '#f97316' }}>.</span>Pulse
            </Link>
            <p className="text-gray-600 text-[11px] mt-1 font-semibold uppercase tracking-widest">
              Independent Research
            </p>
          </div>
          <nav className="flex items-center gap-6 text-[12px] font-bold uppercase tracking-widest">
            <Link href="/pipeline" className="hover:text-white transition-colors">Pipeline</Link>
            <Link href="/feed.xml" className="hover:text-white transition-colors">RSS</Link>
            <a href="mailto:research@bharatpulse.in" className="hover:text-white transition-colors">Contact</a>
          </nav>
        </div>
        <p className="text-gray-700 text-[12px] mt-5 italic">
          &ldquo;The Future Is The Biggest Multibagger.&rdquo;
        </p>
      </div>
    </footer>
  )
}
