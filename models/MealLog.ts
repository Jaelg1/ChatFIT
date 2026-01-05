import mongoose, { Schema, Document, Model } from 'mongoose'

export type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack'

export interface IMealLog extends Document {
  userId: mongoose.Types.ObjectId
  date: Date
  mealType: MealType
}

const MealLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  mealType: {
    type: String,
    enum: ['desayuno', 'almuerzo', 'cena', 'snack'],
    required: true,
  },
})

MealLogSchema.index({ userId: 1, date: -1 })

const MealLog: Model<IMealLog> = mongoose.models.MealLog || mongoose.model<IMealLog>('MealLog', MealLogSchema)

export default MealLog

