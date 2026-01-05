import mongoose, { Schema, Document, Model } from 'mongoose'
import { MealType } from './MealLog'

export interface IRecipeIngredient {
  name: string // Nombre del ingrediente (ej: "Arroz Integral", "Tomate")
  quantity: number
  unit: string // "g", "unidades", "tazas", etc.
  kcalPer100g?: number // Si se conoce, para cálculo preciso
}

export interface IRecipe extends Document {
  name: string
  description?: string
  mealType: MealType
  ingredients: IRecipeIngredient[]
  totalKcal: number // Calorías totales para la receta base
  servings: number // Cantidad de porciones que rinde la receta base
  kcalPerServing: number // Calorías por porción
  macros?: {
    protein?: number // gramos por porción
    carbs?: number
    fat?: number
  }
  tags?: string[] // Para categorización: "vegetariano", "rico en proteínas", etc.
  createdAt: Date
  updatedAt: Date
}

const RecipeIngredientSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  kcalPer100g: { type: Number },
})

const RecipeSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
  },
  mealType: {
    type: String,
    enum: ['desayuno', 'almuerzo', 'cena', 'snack'],
    required: true,
    index: true,
  },
  ingredients: {
    type: [RecipeIngredientSchema],
    required: true,
  },
  totalKcal: {
    type: Number,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
    default: 1,
  },
  kcalPerServing: {
    type: Number,
    required: true,
  },
  macros: {
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

RecipeSchema.index({ mealType: 1, tags: 1 })
RecipeSchema.index({ name: 'text' }) // Para búsqueda por texto

const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema)

export default Recipe

