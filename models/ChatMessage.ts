import mongoose, { Schema, Document, Model } from 'mongoose'

export type MessageRole = 'user' | 'assistant'

export interface IChatMessage extends Document {
  sessionId: mongoose.Types.ObjectId
  role: MessageRole
  content: string
  createdAt: Date
}

const ChatMessageSchema: Schema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 })

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)

export default ChatMessage

