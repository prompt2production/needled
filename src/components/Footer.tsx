import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-6">
      <div className="max-w-4xl mx-auto w-full px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/80">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline text-white/50">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span className="hidden sm:inline text-white/50">|</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <p className="text-center text-xs text-white/60 mt-4">
          &copy; {new Date().getFullYear()} Needled. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
