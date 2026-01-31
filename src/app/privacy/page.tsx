import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy - Needled',
  description: 'Privacy Policy for the Needled app',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#14B8A6]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-white/95 rounded-2xl p-6 md:p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
              <p className="text-gray-600 mb-4">
                Needled (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our
                mobile application and related services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Account Information</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                <li>Email address (for account creation and notifications)</li>
                <li>Name (optional, for personalisation)</li>
                <li>Password (securely hashed, never stored in plain text)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Health & Wellness Data</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                <li>Weight measurements and weigh-in dates</li>
                <li>Height (for BMI calculation, if provided)</li>
                <li>Injection tracking data (medication type, dose, dates, injection sites)</li>
                <li>Daily habit check-ins (hydration, nutrition, movement)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Device type and operating system</li>
                <li>App version</li>
                <li>Usage analytics (anonymised)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To send you injection reminders and weigh-in notifications</li>
                <li>To display your progress and health trends</li>
                <li>To improve our app and develop new features</li>
                <li>To respond to your support requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Storage & Security</h2>
              <p className="text-gray-600 mb-4">
                Your data is stored securely using industry-standard encryption. We use secure HTTPS connections
                for all data transmission. Your health data is never sold to third parties.
              </p>
              <p className="text-gray-600">
                We retain your data for as long as your account is active. You can request deletion of your
                account and all associated data at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Services</h2>
              <p className="text-gray-600 mb-4">We use the following third-party services:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li><strong>SendGrid:</strong> For sending email notifications and reminders</li>
                <li><strong>Analytics:</strong> Anonymised usage data to improve the app</li>
              </ul>
              <p className="text-gray-600 mt-4">
                We do not share your personal health data with advertisers or data brokers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Access your personal data</li>
                <li>Export your data in a portable format</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and all associated data</li>
                <li>Opt out of non-essential notifications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Children&apos;s Privacy</h2>
              <p className="text-gray-600">
                Needled is not intended for use by children under 18 years of age. We do not knowingly collect
                personal information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any significant
                changes by email or through the app. Your continued use of the app after such changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please{' '}
                <Link href="/contact" className="text-[#14B8A6] hover:underline">
                  contact us
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
