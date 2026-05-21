import './globals.css'

export const metadata = {
  title: 'Bharat.Pulse | Independent Investment Research on India & Emerging Markets',
  description: 'Long-horizon, data-driven equity research on Indian smallcaps and emerging markets. Free newsletter for serious long-term investors.',
  openGraph: {
    type: 'website',
    siteName: 'Bharat.Pulse',
    title: 'Bharat.Pulse | Independent Investment Research on India & Emerging Markets',
    description: 'Long-horizon, data-driven equity research on Indian smallcaps and emerging markets.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="Bharat.Pulse Research Feed" href="/feed.xml" />
        {/* Inline script prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t = localStorage.getItem('bp-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', t);
          })()
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
