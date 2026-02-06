import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all active medications with their dosages and pen strengths
    const medications = await prisma.medicationConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        dosages: {
          orderBy: { sortOrder: 'asc' },
        },
        penStrengths: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // Fetch all active microdose amounts
    const microdoseAmounts = await prisma.microdoseAmount.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    // Fetch default doses per pen from system config
    const defaultDosesPerPenConfig = await prisma.systemConfig.findUnique({
      where: { key: 'defaultDosesPerPen' },
    })

    // Transform data to match the expected API response format
    const response = {
      medications: medications.map((med) => ({
        code: med.code,
        name: med.name,
        manufacturer: med.manufacturer,
        dosages: med.dosages.map((d) => Number(d.dosageMg)),
        penStrengths: med.penStrengths.map((p) => Number(p.strengthMg)),
        supportsMicrodosing: med.supportsMicrodosing,
      })),
      microdoseAmounts: microdoseAmounts.map((m) => Number(m.amountMg)),
      defaultDosesPerPen: defaultDosesPerPenConfig
        ? parseInt(defaultDosesPerPenConfig.value, 10)
        : 4, // Fallback to 4 if not configured
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=86400',
      },
    })
  } catch (error) {
    console.error('Medication configuration fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication configuration' },
      { status: 500 }
    )
  }
}
