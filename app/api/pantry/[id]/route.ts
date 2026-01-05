import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import PantryItem from '@/models/PantryItem'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { quantity, unit, expiryDate } = body

    const item = await PantryItem.findOne({
      _id: params.id,
      userId: result.user!._id,
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (quantity !== undefined) item.quantity = quantity
    if (unit !== undefined) item.unit = unit
    if (expiryDate !== undefined) item.expiryDate = expiryDate ? new Date(expiryDate) : undefined

    await item.save()
    await item.populate('foodId')

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error('Pantry PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const item = await PantryItem.findOneAndDelete({
      _id: params.id,
      userId: result.user!._id,
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Pantry DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

