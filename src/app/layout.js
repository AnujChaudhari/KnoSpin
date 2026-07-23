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
  title: {
    default: 'SPINOVA - Marketplace, Community & Digital Library',
    template: '%s | SPINOVA'
  },
  description: 'Spin the wheel, earn rewards, join communities, read free books, and shop unique products. India\'s gamified social ecosystem.',
  keywords: 'gamified marketplace, community groups, digital library, spin to earn, social commerce india, online earning platform',
  openGraph: {
    title: 'SPINOVA - A New Spin on Community & Commerce',
    description: 'Spin, earn rewards, connect with communities, and access a vast digital library. Join the SPINOVA ecosystem today!',
    url: 'https://quickshoppro.vercel.app', // Baad mein spinova.com kar dena
    siteName: 'SPINOVA',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  // Thoda sa extra SEO boost (optional)
  verification: {
    // Agar Google Search Console hai toh yahan daalna
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* favicon */}
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClientProviders>{children}</ClientProviders>
      {/* Daily Reward popup (client‑only) */}
        {/* <DailyReward /> */}
<script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
    `,
  }}
/>
      </body>
    </html>
  )
}
