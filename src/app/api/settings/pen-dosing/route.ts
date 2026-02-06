import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updatePenDosingSchema } from '@/lib/validations/pen-dosing'
import { calculateDosesPerPen } from '@/lib/dose-tracking'
import { authenticateRequest } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        dosingMode: true,
        penStrengthMg: true,
        doseAmountMg: true,
        dosesPerPen: true,
        tracksGoldenDose: true,
        currentDoseInPen: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      dosingMode: user.dosingMode.toLowerCase(),
      penStrengthMg: user.penStrengthMg ? Number(user.penStrengthMg) : null,
      doseAmountMg: user.doseAmountMg ? Number(user.doseAmountMg) : null,
      dosesPerPen: user.dosesPerPen,
      tracksGoldenDose: user.tracksGoldenDose,
      currentDoseInPen: user.currentDoseInPen,
    })
  } catch (error) {
    console.error('Failed to fetch pen dosing settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updatePenDosingSchema.parse(body)

    // Get current user to check existing settings
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        dosingMode: true,
        penStrengthMg: true,
        doseAmountMg: true,
        dosesPerPen: true,
        tracksGoldenDose: true,
        currentDoseInPen: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine final values (merge with current)
    const newDosingMode = validated.dosingMode ?? currentUser.dosingMode
    const newPenStrengthMg = validated.penStrengthMg !== undefined ? validated.penStrengthMg : (currentUser.penStrengthMg ? Number(currentUser.penStrengthMg) : null)
    const newDoseAmountMg = validated.doseAmountMg !== undefined ? validated.doseAmountMg : (currentUser.doseAmountMg ? Number(currentUser.doseAmountMg) : null)
    const newTracksGoldenDose = validated.tracksGoldenDose ?? currentUser.tracksGoldenDose

    // Calculate dosesPerPen for microdosers, or use provided value
    let newDosesPerPen: number
    if (newDosingMode === 'MICRODOSE' && newPenStrengthMg && newDoseAmountMg) {
      newDosesPerPen = calculateDosesPerPen(newPenStrengthMg, newDoseAmountMg)
    } else {
      newDosesPerPen = validated.dosesPerPen ?? currentUser.dosesPerPen
    }

    // Determine currentDoseInPen - reset if it exceeds new config
    let newCurrentDoseInPen = validated.currentDoseInPen ?? currentUser.currentDoseInPen
    const maxDose = newDosesPerPen + (newTracksGoldenDose ? 1 : 0)
    if (newCurrentDoseInPen > maxDose) {
      newCurrentDoseInPen = 1 // Reset to start of new pen
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        dosingMode: newDosingMode,
        penStrengthMg: newPenStrengthMg,
        doseAmountMg: newDoseAmountMg,
        dosesPerPen: newDosesPerPen,
        tracksGoldenDose: newTracksGoldenDose,
        currentDoseInPen: newCurrentDoseInPen,
      },
      select: {
        dosingMode: true,
        penStrengthMg: true,
        doseAmountMg: true,
        dosesPerPen: true,
        tracksGoldenDose: true,
        currentDoseInPen: true,
      },
    })

    return NextResponse.json({
      dosingMode: updatedUser.dosingMode.toLowerCase(),
      penStrengthMg: updatedUser.penStrengthMg ? Number(updatedUser.penStrengthMg) : null,
      doseAmountMg: updatedUser.doseAmountMg ? Number(updatedUser.doseAmountMg) : null,
      dosesPerPen: updatedUser.dosesPerPen,
      tracksGoldenDose: updatedUser.tracksGoldenDose,
      currentDoseInPen: updatedUser.currentDoseInPen,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to update pen dosing settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
