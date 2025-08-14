'use client'

import { usePathname } from 'next/navigation'
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import { SiteHeader } from "@/components/site-header"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    )
  }

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </div>
      <Footer />
      <ScrollToTop />
    </>
  )
}