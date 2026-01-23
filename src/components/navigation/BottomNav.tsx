'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scale, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/weigh-in', icon: Scale, label: 'Weight' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card/80 backdrop-blur-lg border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'bg-lime text-black'
                  : 'text-muted-foreground hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
