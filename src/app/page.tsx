import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#14B8A6] flex flex-col">
      <div className="flex-1 flex flex-col px-6">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-12 max-w-4xl mx-auto w-full">
          {/* Pip Mascot with floating animation */}
          <div className="animate-float mb-6">
            <Image
              src="/pip/pip-cheerful.png"
              alt="Pip, your friendly GLP-1 journey companion"
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Brand */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome to Needled
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-12">
            Your GLP-1 journey companion
          </p>

          {/* App Store CTAs - styled like native app buttons */}
          <div className="w-full max-w-sm space-y-3 mb-16">
            <Button
              asChild
              className="w-full h-14 rounded-full bg-white text-gray-800 hover:bg-gray-100 font-semibold text-lg shadow-lg"
            >
              <a href="#ios" className="flex items-center justify-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download for iOS
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-14 rounded-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold text-lg"
            >
              <a href="#android" className="flex items-center justify-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 2.234a.5.5 0 00-.87.49l1.09 1.89a6.622 6.622 0 00-5.743-.001l1.09-1.89a.5.5 0 10-.87-.489L11.1 4.254a6.552 6.552 0 00-3.1 5.496H16a6.552 6.552 0 00-3.1-5.496l1.12-1.94a.5.5 0 00.503-.08zM9.5 7.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM5.5 11a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm13 0a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zM8 10.75A.25.25 0 018.25 10.5h7.5a.25.25 0 01.25.25v7.5a2.25 2.25 0 01-2.25 2.25h-3.5A2.25 2.25 0 018 18.25v-7.5zM9.75 21.25a1 1 0 011-1h.5v2.25a1 1 0 102 0v-2.25h.5a1 1 0 011 1v1.25a1 1 0 11-2 0v-.25h-1v.25a1 1 0 11-2 0v-1.25z"/>
                </svg>
                Download for Android
              </a>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid gap-4 md:grid-cols-3 w-full max-w-3xl">
            <FeatureCard
              iconSrc="/icons/injection.png"
              iconAlt="Injection tracking icon"
              title="Track Injections"
              description="Never miss a dose"
            />
            <FeatureCard
              iconSrc="/icons/weigh-in.png"
              iconAlt="Weigh-in tracking icon"
              title="Weekly Weigh-ins"
              description="See your progress"
            />
            <FeatureCard
              habitIcons={[
                { src: '/icons/water.png', alt: 'Hydration habit' },
                { src: '/icons/nutrition.png', alt: 'Nutrition habit' },
                { src: '/icons/exercise.png', alt: 'Exercise habit' },
              ]}
              title="Build Habits"
              description="Hydration, nutrition & movement"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/80">
              <Link href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden sm:inline text-white/50">|</span>
              <Link href="#terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="hidden sm:inline text-white/50">|</span>
              <Link href="mailto:support@needled.app" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-center text-xs text-white/60 mt-4">
              &copy; {new Date().getFullYear()} Needled. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}

function FeatureCard({
  iconSrc,
  iconAlt,
  habitIcons,
  title,
  description,
}: {
  iconSrc?: string
  iconAlt?: string
  habitIcons?: { src: string; alt: string }[]
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/95 shadow-lg">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
        {iconSrc && (
          <Image
            src={iconSrc}
            alt={iconAlt || title}
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
        )}
        {habitIcons && (
          <div className="flex -space-x-1">
            {habitIcons.map((icon, index) => (
              <Image
                key={icon.src}
                src={icon.src}
                alt={icon.alt}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
                style={{ zIndex: habitIcons.length - index }}
              />
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
