'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scale, User, Syringe } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/weigh-in', icon: Scale, label: 'Weight' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Header() {
  const pathname = usePathname()

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
      </div>
    </header>
  )
}
