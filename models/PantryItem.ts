import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPantryItem extends Document {
  userId: mongoose.Types.ObjectId
  foodId?: mongoose.Types.ObjectId
  customName?: string
  quantity: number
  unit: string
  expiryDate?: Date
  createdAt: Date
}

const PantryItemSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  foodId: {
    type: Schema.Types.ObjectId,
    ref: 'Food',
  },
  customName: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    default: 'g',
  },
  expiryDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

PantryItemSchema.index({ userId: 1 })

const PantryItem: Model<IPantryItem> = mongoose.models.PantryItem || mongoose.model<IPantryItem>('PantryItem', PantryItemSchema)

export default PantryItem

