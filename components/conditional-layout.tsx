'use client'

import { usePathname } from 'next/navigation'
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import { SiteHeader } from "@/components/site-header"
import { cn } from '@/lib/utils'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isHomePage = pathname === '/'

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
        <SiteHeader isHomePage={isHomePage} />
        <div className={cn(
          "flex-1",
          !isHomePage && "pt-16 md:pt-[72px]"
        )}>
          {children}
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </>
  )
}
