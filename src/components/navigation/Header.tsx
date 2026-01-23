'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scale, User, Syringe, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/weigh-in', icon: Scale, label: 'Weight' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-card border-b border-border z-50">
      <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Syringe className="h-6 w-6 text-lime" />
          <span className="text-lg font-semibold text-white">Needled</span>
        </Link>

        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-lime text-black'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile hamburger menu - visible on mobile only */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-card border-l border-border w-64"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-white">
                <Syringe className="h-5 w-5 text-lime" />
                Needled
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-lime text-black'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
