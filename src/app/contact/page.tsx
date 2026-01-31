'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/Footer'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error && Array.isArray(data.error)) {
          setError(data.error[0]?.message || 'Please check your input')
        } else {
          setError('Something went wrong. Please try again.')
        }
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#14B8A6] flex flex-col">
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="bg-white/95 rounded-2xl p-6 md:p-8 shadow-lg">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="animate-float mx-auto mb-6">
                  <Image
                    src="/pip/pip-cheerful.png"
                    alt="Pip is happy"
                    width={120}
                    height={120}
                    className="w-28 h-28 object-contain mx-auto"
                  />
                </div>
                <div className="w-16 h-16 rounded-full bg-[#14B8A6]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#14B8A6]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
                <Button asChild className="bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-full px-6">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="animate-float">
                    <Image
                      src="/pip/pip-cheerful.png"
                      alt="Pip"
                      width={60}
                      height={60}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Get in Touch</h1>
                    <p className="text-gray-600">We&apos;d love to hear from you</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                      disabled={status === 'submitting'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                      disabled={status === 'submitting'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      className="min-h-[150px] rounded-xl border-gray-200 focus:border-[#14B8A6] focus:ring-[#14B8A6] resize-none"
                      disabled={status === 'submitting'}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full h-12 rounded-full bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
