import './globals.css'
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/ClientProviders'
// import nextDynamic from 'next/dynamic'

// Force dynamic rendering – prevents static build errors
export const dynamic = 'force-dynamic'

// Load DailyReward only on the client (no SSR)
// const DailyReward = nextDynamic(() => import('@/components/DailyReward'), { ssr: false })

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
        <link rel="icon" href="/logo.jpg" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClientProviders>{children}</ClientProviders>
      {/* Daily Reward popup (client‑only) */}
        {/* <DailyReward /> */}
      </body>
    </html>
  )
}
