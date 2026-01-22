import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="text-center px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Starter Template
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-4">
          Prompt2Production
        </h1>
        <p className="text-xl text-slate-600 max-w-md mx-auto mb-8">
          Your application homepage will go here.
        </p>
        <Link
          href="/dev"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          View Developer Guide
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
