import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  firebaseUid: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
}

const UserSchema: Schema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

