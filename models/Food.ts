import mongoose, { Schema, Document, Model } from 'mongoose'

export type UnitType = 'g' | 'unit'

export interface IFood extends Document {
  name: string
  kcalPer100g: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  unitType: UnitType
}

const FoodSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  kcalPer100g: {
    type: Number,
    required: true,
  },
  proteinPer100g: {
    type: Number,
  },
  carbsPer100g: {
    type: Number,
  },
  fatPer100g: {
    type: Number,
  },
  unitType: {
    type: String,
    enum: ['g', 'unit'],
    required: true,
    default: 'g',
  },
})

const Food: Model<IFood> = mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema)

export default Food

