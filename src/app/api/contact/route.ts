import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactMessageSchema } from '@/lib/validations/contact'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactMessageSchema.parse(body)

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        message: validated.message,
      },
    })

    return NextResponse.json(
      { id: contactMessage.id, message: 'Message sent successfully' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
