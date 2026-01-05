import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)

    if (result.error) {
      return result.error
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

