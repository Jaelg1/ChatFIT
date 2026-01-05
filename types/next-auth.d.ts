import { IUser } from '@/models/User'

declare module 'next' {
  interface NextRequest {
    user?: IUser
  }
}

