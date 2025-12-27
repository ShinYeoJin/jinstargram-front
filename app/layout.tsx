import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Insta',
  description: 'Instagram-style social media application',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={notoSansKR.className}>
        <AuthProviderWrapper>
          <Navbar />
          <main>{children}</main>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}
