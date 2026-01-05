import mongoose, { Schema, Document, Model } from 'mongoose'

export type CategoriaIMC = 'bajo_peso' | 'normal' | 'sobrepeso' | 'obesidad'

export interface IBMIHistory extends Document {
  userId: mongoose.Types.ObjectId
  peso: number
  altura: number
  imc: number
  categoria: CategoriaIMC
  createdAt: Date
}

const BMIHistorySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  peso: {
    type: Number,
    required: true,
  },
  altura: {
    type: Number,
    required: true,
  },
  imc: {
    type: Number,
    required: true,
  },
  categoria: {
    type: String,
    enum: ['bajo_peso', 'normal', 'sobrepeso', 'obesidad'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

BMIHistorySchema.index({ userId: 1, createdAt: -1 })

const BMIHistory: Model<IBMIHistory> = mongoose.models.BMIHistory || mongoose.model<IBMIHistory>('BMIHistory', BMIHistorySchema)

export default BMIHistory

