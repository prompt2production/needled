import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service - Needled',
  description: 'Terms of Service for the Needled app',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Agreement to Terms</h2>
              <p className="text-gray-600">
                By downloading, installing, or using Needled (&quot;the App&quot;), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use the App.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Description of Service</h2>
              <p className="text-gray-600">
                Needled is a personal health tracking application designed to help users track their weight loss
                journey, GLP-1 medication injections, and daily wellness habits. The App provides tools for
                logging weigh-ins, scheduling injection reminders, and tracking hydration, nutrition, and
                movement habits.
              </p>
            </section>

            <section className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-amber-800 mb-3">Medical Disclaimer</h2>
              <p className="text-amber-700 mb-4">
                <strong>Needled is not a medical device and does not provide medical advice.</strong>
              </p>
              <ul className="list-disc pl-5 text-amber-700 space-y-2">
                <li>The App is for informational and tracking purposes only</li>
                <li>Always consult your healthcare provider before starting, changing, or stopping any medication</li>
                <li>Do not use the App as a substitute for professional medical advice, diagnosis, or treatment</li>
                <li>If you have concerns about your medication or health, contact your doctor immediately</li>
                <li>In case of emergency, call your local emergency services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">User Accounts</h2>
              <p className="text-gray-600 mb-4">To use Needled, you must:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorised access to your account</li>
              </ul>
              <p className="text-gray-600 mt-4">
                You are responsible for all activity that occurs under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Acceptable Use</h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Use the App for any unlawful purpose</li>
                <li>Attempt to gain unauthorised access to the App or its systems</li>
                <li>Interfere with or disrupt the App or servers</li>
                <li>Share your account credentials with others</li>
                <li>Use the App to store false or misleading health information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Data</h2>
              <p className="text-gray-600 mb-4">
                You retain ownership of the health and personal data you enter into the App. By using the App,
                you grant us a limited license to store, process, and display your data for the purpose of
                providing the service.
              </p>
              <p className="text-gray-600">
                You can export or delete your data at any time through the App settings. See our{' '}
                <Link href="/privacy" className="text-[#14B8A6] hover:underline">
                  Privacy Policy
                </Link>{' '}
                for more details on how we handle your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Service Availability</h2>
              <p className="text-gray-600">
                We strive to provide reliable service but do not guarantee uninterrupted access. The App may be
                temporarily unavailable for maintenance, updates, or due to circumstances beyond our control.
                We are not liable for any loss or inconvenience caused by service interruptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by law, Needled and its operators shall not be liable for:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Loss of data or business interruption</li>
                <li>Any health outcomes or medical decisions made based on information in the App</li>
                <li>Missed notifications or reminders due to technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Intellectual Property</h2>
              <p className="text-gray-600">
                The App, including its design, features, content, and branding, is owned by Needled and
                protected by intellectual property laws. You may not copy, modify, distribute, or create
                derivative works without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Account Termination</h2>
              <p className="text-gray-600">
                You may delete your account at any time through the App settings. We reserve the right to
                suspend or terminate accounts that violate these terms. Upon termination, your data will be
                deleted in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to Terms</h2>
              <p className="text-gray-600">
                We may update these Terms of Service from time to time. We will notify you of significant
                changes through the App or by email. Your continued use of the App after changes take effect
                constitutes acceptance of the revised terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Governing Law</h2>
              <p className="text-gray-600">
                These Terms shall be governed by and construed in accordance with the laws of Australia,
                without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please{' '}
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
