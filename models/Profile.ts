import mongoose, { Schema, Document, Model } from 'mongoose'

export type Sexo = 'M' | 'F' | 'O'
export type Actividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo'
export type Objetivo = 'perder' | 'mantener' | 'ganar'

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId
  peso: number
  altura: number
  edad: number
  sexo?: Sexo
  actividad?: Actividad
  objetivo?: Objetivo
  caloriasObjetivo?: number
  imcActual?: number
  updatedAt: Date
}

const ProfileSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  peso: {
    type: Number,
    required: true,
  },
  altura: {
    type: Number,
    required: true,
  },
  edad: {
    type: Number,
    required: true,
  },
  sexo: {
    type: String,
    enum: ['M', 'F', 'O'],
  },
  actividad: {
    type: String,
    enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'],
  },
  objetivo: {
    type: String,
    enum: ['perder', 'mantener', 'ganar'],
  },
  caloriasObjetivo: {
    type: Number,
  },
  imcActual: {
    type: Number,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

ProfileSchema.index({ userId: 1 })

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile

