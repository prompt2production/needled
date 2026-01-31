import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateInjectionSchema } from '@/lib/validations/injection'
import { authenticateRequest } from '@/lib/api-auth'
import { z } from 'zod'
import { InjectionSite, Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateInjectionSchema.parse(body)

    // Check if injection exists and belongs to authenticated user
    const existing = await prisma.injection.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Injection not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Prisma.InjectionUpdateInput = {}
    if (validated.site !== undefined) {
      updateData.site = validated.site as InjectionSite
    }
    if (validated.doseNumber !== undefined) {
      updateData.doseNumber = validated.doseNumber
    }
    if (validated.notes !== undefined) {
      updateData.notes = validated.notes
    }
    if (validated.date !== undefined) {
      updateData.date = new Date(validated.date + 'T12:00:00Z')
    }

    const updated = await prisma.injection.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to update injection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    // Check if injection exists and belongs to authenticated user
    const existing = await prisma.injection.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Injection not found' },
        { status: 404 }
      )
    }

    await prisma.injection.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete injection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
