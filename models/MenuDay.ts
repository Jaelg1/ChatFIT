import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMenuDay extends Document {
  weeklyMenuId: mongoose.Types.ObjectId
  date: Date
}

const MenuDaySchema: Schema = new Schema({
  weeklyMenuId: {
    type: Schema.Types.ObjectId,
    ref: 'WeeklyMenu',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
})

MenuDaySchema.index({ weeklyMenuId: 1 })

const MenuDay: Model<IMenuDay> = mongoose.models.MenuDay || mongoose.model<IMenuDay>('MenuDay', MenuDaySchema)

export default MenuDay

