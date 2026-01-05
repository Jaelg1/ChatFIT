import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import BMIHistory from '@/models/BMIHistory'
import Profile from '@/models/Profile'
import { calculateBMI, getBMICategory } from '@/lib/utils/bmi'

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { peso, altura } = body

    if (!peso || !altura) {
      return NextResponse.json(
        { error: 'peso y altura son requeridos' },
        { status: 400 }
      )
    }

    // Calcular IMC
    const imc = calculateBMI(peso, altura)
    const categoria = getBMICategory(imc)

    // Guardar en historial
    const historyEntry = await BMIHistory.create({
      userId: result.user!._id,
      peso,
      altura,
      imc,
      categoria,
    })

    // Actualizar perfil si existe
    await Profile.findOneAndUpdate(
      { userId: result.user!._id },
      { imcActual: imc, updatedAt: new Date() }
    )

    return NextResponse.json({
      imc,
      categoria,
      historyEntry,
    })
  } catch (error: any) {
    console.error('BMI Calculate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

