import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Release Ready',
  description: 'Know when you\'re ready to ship.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased" style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif' }}>
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              Release Ready
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/templates" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link
                href="/releases/new"
                className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                + New Release
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
