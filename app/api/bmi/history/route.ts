import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import BMIHistory from '@/models/BMIHistory'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const history = await BMIHistory.find({ userId: result.user!._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('BMI History error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

