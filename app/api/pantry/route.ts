import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import PantryItem from '@/models/PantryItem'
import Food from '@/models/Food'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const items = await PantryItem.find({ userId: result.user!._id })
      .populate('foodId')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('Pantry GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { foodId, customName, quantity, unit, expiryDate } = body

    if (!quantity || !unit) {
      return NextResponse.json(
        { error: 'quantity y unit son requeridos' },
        { status: 400 }
      )
    }

    if (!foodId && !customName) {
      return NextResponse.json(
        { error: 'foodId o customName es requerido' },
        { status: 400 }
      )
    }

    const item = await PantryItem.create({
      userId: result.user!._id,
      foodId,
      customName,
      quantity,
      unit,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    })

    await item.populate('foodId')

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error('Pantry POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

