import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Bharat Pulse — Future Research Lab',
  description: 'Researching structural shifts before markets fully understand them. Independent long-horizon research on AI, telecom, emerging markets, and civilizational change.',
  openGraph: {
    type: 'website',
    siteName: 'Bharat Pulse',
    title: 'Bharat Pulse — Future Research Lab',
    description: 'Researching structural shifts before markets fully understand them.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bharatpulse',
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Bharat Pulse Research Feed" href="/feed.xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
