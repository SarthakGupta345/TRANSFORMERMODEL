import type { Metadata } from 'next'
import './globals.css'
import AppSidebar from '@/components/sidebar/AppSidebar'

export const metadata: Metadata = {
  title: 'AI Assistant',
  description: 'Premium AI Chat Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}
