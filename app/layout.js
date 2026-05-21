import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Gloww — Future Research Lab',
  description: 'Researching structural shifts before markets fully understand them. Independent long-horizon research on AI, telecom, emerging markets, and civilizational change.',
  openGraph: {
    type: 'website',
    siteName: 'Gloww',
    title: 'Gloww — Future Research Lab',
    description: 'Researching structural shifts before markets fully understand them.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@glowwresearch',
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Gloww Research Feed" href="/feed.xml" />
        {/* Set dark theme immediately to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.setAttribute('data-theme','dark')` }} />
      </head>
      <body className="bg-g-bg text-g-text font-sans antialiased">{children}</body>
    </html>
  )
}
