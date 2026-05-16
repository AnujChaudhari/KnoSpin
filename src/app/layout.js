import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Quick Shop - Your Mobile Store',
  description: 'Shop the best products at unbeatable prices',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster position="top-center" />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}