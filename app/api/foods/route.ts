import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import Food from '@/models/Food'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    let query: any = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const foods = await Food.find(query).limit(50).lean()

    return NextResponse.json({ foods })
  } catch (error: any) {
    console.error('Foods GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { name, kcalPer100g, proteinPer100g, carbsPer100g, fatPer100g, unitType } = body

    if (!name || !kcalPer100g) {
      return NextResponse.json(
        { error: 'name y kcalPer100g son requeridos' },
        { status: 400 }
      )
    }

    const food = await Food.create({
      name,
      kcalPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      unitType: unitType || 'g',
    })

    return NextResponse.json({ food })
  } catch (error: any) {
    console.error('Foods POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

