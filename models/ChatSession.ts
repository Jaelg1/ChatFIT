import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId
  createdAt: Date
}

const ChatSessionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

ChatSessionSchema.index({ userId: 1, createdAt: -1 })

const ChatSession: Model<IChatSession> = mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema)

export default ChatSession

