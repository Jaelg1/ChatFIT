import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWeeklyMenu extends Document {
  userId: mongoose.Types.ObjectId
  weekStartDate: Date
  targetKcal: number
}

const WeeklyMenuSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  targetKcal: {
    type: Number,
    required: true,
  },
})

WeeklyMenuSchema.index({ userId: 1, weekStartDate: -1 })

const WeeklyMenu: Model<IWeeklyMenu> = mongoose.models.WeeklyMenu || mongoose.model<IWeeklyMenu>('WeeklyMenu', WeeklyMenuSchema)

export default WeeklyMenu

