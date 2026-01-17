import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import MealLog from '@/models/MealLog'
import MealItem from '@/models/MealItem'
import Food from '@/models/Food'

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

    let mealItems: any[] = []

    // Si hay items, actualizar
    if (items && Array.isArray(items)) {
      // Eliminar items existentes
      await MealItem.deleteMany({ mealLogId: mealLog._id })

      // Crear nuevos items (misma lógica que en POST)
      const createdItems = await Promise.all(
        items.map(async (item: any) => {
          let estimatedKcal = item.estimatedKcal || 0
          let macros = item.macros

          if (item.foodId) {
            const food = await Food.findById(item.foodId)
            if (food) {
              const multiplier = item.quantity / 100
              estimatedKcal = food.kcalPer100g * multiplier
              macros = {
                protein: food.proteinPer100g
                  ? food.proteinPer100g * multiplier
                  : undefined,
                carbs: food.carbsPer100g ? food.carbsPer100g * multiplier : undefined,
                fat: food.fatPer100g ? food.fatPer100g * multiplier : undefined,
              }
            }
          }

          return MealItem.create({
            mealLogId: mealLog._id,
            foodId: item.foodId,
            customName: item.customName,
            quantity: item.quantity,
            unit: item.unit || 'g',
            estimatedKcal,
            macros,
          })
        })
      )

      const populatedItems = await Promise.all(
        createdItems.map(async (item) => {
          await item.populate('foodId')
          return item.toObject()
        })
      )

      mealItems = populatedItems
    } else {
      mealItems = await MealItem.find({ mealLogId: mealLog._id })
        .populate('foodId')
        .lean()
    }

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

