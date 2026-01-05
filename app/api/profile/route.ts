import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import Profile from '@/models/Profile'
import { calculateBMI, getBMICategory } from '@/lib/utils/bmi'
import { calculateDailyCalories } from '@/lib/utils/calories'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const profile = await Profile.findOne({ userId: result.user!._id }).lean()

    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { peso, altura, edad, sexo, actividad, objetivo } = body

    // Validar campos requeridos
    if (!peso || !altura || !edad) {
      return NextResponse.json(
        { error: 'peso, altura y edad son requeridos' },
        { status: 400 }
      )
    }

    // Calcular IMC
    const imc = calculateBMI(peso, altura)
    const categoria = getBMICategory(imc)

    // Calcular calorías objetivo si hay suficiente información
    let caloriasObjetivo: number | undefined
    if (sexo && actividad && objetivo) {
      caloriasObjetivo = calculateDailyCalories(peso, altura, edad, sexo, actividad, objetivo)
    }

    // Buscar o crear perfil
    let profile = await Profile.findOne({ userId: result.user!._id })

    if (profile) {
      // Actualizar perfil existente
      profile.peso = peso
      profile.altura = altura
      profile.edad = edad
      profile.sexo = sexo
      profile.actividad = actividad
      profile.objetivo = objetivo
      profile.imcActual = imc
      profile.caloriasObjetivo = caloriasObjetivo
      profile.updatedAt = new Date()
      await profile.save()
    } else {
      // Crear nuevo perfil
      profile = await Profile.create({
        userId: result.user!._id,
        peso,
        altura,
        edad,
        sexo,
        actividad,
        objetivo,
        imcActual: imc,
        caloriasObjetivo,
      })
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Profile POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

