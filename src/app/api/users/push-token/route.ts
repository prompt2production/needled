import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'
import { pushTokenInputSchema } from '@/lib/validations/push-token'
import { z } from 'zod'

/**
 * POST /api/users/push-token
 * Register or update the user's Expo push token
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validated = pushTokenInputSchema.parse(body)

    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        expoPushToken: validated.token,
        pushTokenPlatform: validated.platform,
        pushTokenUpdatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Push token registered successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to register push token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/users/push-token
 * Remove the user's push token (called on logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        expoPushToken: null,
        pushTokenPlatform: null,
        pushTokenUpdatedAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Push token removed successfully',
    })
  } catch (error) {
    console.error('Failed to remove push token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
