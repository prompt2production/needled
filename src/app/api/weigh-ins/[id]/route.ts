import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateWeighInSchema } from '@/lib/validations/weigh-in'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateWeighInSchema.parse(body)

    // Check if weigh-in exists and belongs to user
    const existing = await prisma.weighIn.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== validated.userId) {
      return NextResponse.json(
        { error: 'Weigh-in not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: { weight?: number; date?: Date } = {}
    if (validated.weight !== undefined) {
      updateData.weight = validated.weight
    }
    if (validated.date !== undefined) {
      updateData.date = new Date(validated.date + 'T12:00:00Z')
    }

    const updated = await prisma.weighIn.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to update weigh-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if weigh-in exists and belongs to user
    const existing = await prisma.weighIn.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Weigh-in not found' },
        { status: 404 }
      )
    }

    await prisma.weighIn.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete weigh-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
