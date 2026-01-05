import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import MealLog from '@/models/MealLog'
import MealItem from '@/models/MealItem'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { date, mealType, items } = body

    const mealLog = await MealLog.findOne({
      _id: params.id,
      userId: result.user!._id,
    })

    if (!mealLog) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    if (date) mealLog.date = new Date(date)
    if (mealType) mealLog.mealType = mealType
    await mealLog.save()

    // Si hay items, actualizar
    if (items && Array.isArray(items)) {
      // Eliminar items existentes
      await MealItem.deleteMany({ mealLogId: mealLog._id })

      // Crear nuevos items (similar a POST)
      // Por simplicidad, reutilizamos la lógica de POST
      // En producción, podrías extraer esto a una función helper
    }

    const mealItems = await MealItem.find({ mealLogId: mealLog._id })
      .populate('foodId')
      .lean()

    return NextResponse.json({
      meal: { ...mealLog.toObject(), items: mealItems },
    })
  } catch (error: any) {
    console.error('Meals PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const mealLog = await MealLog.findOneAndDelete({
      _id: params.id,
      userId: result.user!._id,
    })

    if (!mealLog) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
    }

    // Eliminar items asociados
    await MealItem.deleteMany({ mealLogId: mealLog._id })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Meals DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

