import mongoose, { Schema, Document, Model } from 'mongoose'
import { MealType } from './MealLog'

export interface IMenuMeal extends Document {
  menuDayId: mongoose.Types.ObjectId
  mealType: MealType
  title: string
  recipe: Record<string, any>
  totalKcal: number
  locked: boolean
}

const MenuMealSchema: Schema = new Schema({
  menuDayId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuDay',
    required: true,
    index: true,
  },
  mealType: {
    type: String,
    enum: ['desayuno', 'almuerzo', 'cena', 'snack'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  recipe: {
    type: Schema.Types.Mixed,
    required: true,
  },
  totalKcal: {
    type: Number,
    required: true,
  },
  locked: {
    type: Boolean,
    default: false,
  },
})

MenuMealSchema.index({ menuDayId: 1 })

const MenuMeal: Model<IMenuMeal> = mongoose.models.MenuMeal || mongoose.model<IMenuMeal>('MenuMeal', MenuMealSchema)

export default MenuMeal

