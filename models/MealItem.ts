import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMealItem extends Document {
  mealLogId: mongoose.Types.ObjectId
  foodId?: mongoose.Types.ObjectId
  customName?: string
  quantity: number
  unit: string
  estimatedKcal: number
  macros?: {
    protein?: number
    carbs?: number
    fat?: number
  }
}

const MealItemSchema: Schema = new Schema({
  mealLogId: {
    type: Schema.Types.ObjectId,
    ref: 'MealLog',
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
  estimatedKcal: {
    type: Number,
    required: true,
  },
  macros: {
    protein: Number,
    carbs: Number,
    fat: Number,
  },
})

MealItemSchema.index({ mealLogId: 1 })

const MealItem: Model<IMealItem> = mongoose.models.MealItem || mongoose.model<IMealItem>('MealItem', MealItemSchema)

export default MealItem

