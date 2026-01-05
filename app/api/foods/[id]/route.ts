import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import Food from '@/models/Food'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const food = await Food.findById(params.id).lean()

    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 })
    }

    return NextResponse.json({ food })
  } catch (error: any) {
    console.error('Food GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

