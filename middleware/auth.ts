import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin/config'
import connectDB from '@/lib/mongodb/connect'
import User from '@/models/User'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string
    firebaseUid: string
    email: string
    name: string
    avatarUrl?: string
  }
}

export async function verifyFirebaseToken(
  req: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: NextResponse.json({ error: 'No token provided' }, { status: 401 }),
      }
    }

    const token = authHeader.split('Bearer ')[1]

    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token)
    const { uid, email, name, picture } = decodedToken

    // Connect to MongoDB
    await connectDB()

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: uid })

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        name: name || '',
        avatarUrl: picture,
      })
    } else {
      // Update user info if changed
      if (email && user.email !== email) user.email = email
      if (name && user.name !== name) user.name = name
      if (picture && user.avatarUrl !== picture) user.avatarUrl = picture
      await user.save()
    }

    return {
      user: {
        _id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      error: null,
    }
  } catch (error: any) {
    console.error('Auth error:', error)
    return {
      user: null,
      error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    }
  }
}

