import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import ClientProviders from '@/components/ClientProviders'

// Force dynamic rendering – prevents static build errors
export const dynamic = 'force-dynamic'

// ─── फॉन्ट कॉन्फ़िगरेशन ───
const inter = Inter({ 
  subsets: ['latin'] 
})

// Poppins – सिर्फ Brand Name (KnoSpin) के लिए Heavy/Bold weights
const poppins = Poppins({
  weight: ['700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

// ─── SEO मेटाडेटा (KnoSpin Branding) ───
export const metadata = {
  title: {
    default: 'KnoSpin - Learn, Spin & Grow | Marketplace, Community & Library',
    template: '%s | KnoSpin'
  },
  description: 'Upskill with expert courses, spin the wheel to earn daily rewards, connect with community groups, read free books, and discover unique products. India\'s gamified ed-tech ecosystem.',
  keywords: 'online courses, gamified learning, spin to earn, community groups, digital library, skill development, social learning india',
  openGraph: {
    title: 'KnoSpin - Learn, Spin & Grow',
    description: 'Join KnoSpin to learn new skills, spin for rewards, and connect with a like-minded community. Your all-in-one ed-tech platform.',
    url: 'https://quickshoppro.vercel.app',
    siteName: 'KnoSpin',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // AdSense verification (optional but recommended)
    google: 'ca-pub-2369556419445213', // Isse Google Search Console mein bhi verify kar sakte ho
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
        
        {/* 🚨 GOOGLE ADSENSE VERIFICATION (Crawler ke liye) */}
        <meta name="google-adsense-account" content="ca-pub-2369556419445213" />

        {/* 🚨 GOOGLE ADSENSE RUNTIME SCRIPT (Ads render karne ke liye) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2369556419445213"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${poppins.variable} min-h-screen flex flex-col`}>
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
