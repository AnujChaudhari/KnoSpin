import './globals.css'
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/ClientProviders'
import nextDynamic from 'next/dynamic'   // ✅ renamed import

// Force dynamic rendering – prevents static build errors
export const dynamic = 'force-dynamic'

// Load DailyReward only on the client (no SSR)
const DailyReward = nextDynamic(() => import('@/components/DailyReward'), { ssr: false })

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Quick Shop – Your Mobile Store',
  description: 'Shop digital & physical products. Earn coins with referrals. Fast delivery & great deals.',
  openGraph: {
    title: 'Quick Shop',
    description: 'Shop digital & physical products. Earn coins with referrals.',
    url: 'https://quickshoppro.vercel.app',
    siteName: 'Quick Shop',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClientProviders>{children}</ClientProviders>
        {/* Daily Reward popup (client‑only) */}
        <DailyReward />
        {/* Register service worker for offline caching */}
       // <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('Service Worker registered with scope: ', reg.scope);
                  }).catch(function(err) {
                    console.log('Service Worker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
