import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import MealLog from '@/models/MealLog'
import MealItem from '@/models/MealItem'
import Food from '@/models/Food'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    let date: Date
    if (dateParam) {
      date = new Date(dateParam)
    } else {
      date = new Date()
      date.setHours(0, 0, 0, 0)
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const meals = await MealLog.find({
      userId: result.user!._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ date: 1 })
      .lean()

    // Populate items for each meal
    const mealsWithItems = await Promise.all(
      meals.map(async (meal) => {
        const items = await MealItem.find({ mealLogId: meal._id })
          .populate('foodId')
          .lean()
        return { ...meal, items }
      })
    )

    return NextResponse.json({ meals: mealsWithItems })
  } catch (error: any) {
    console.error('Meals GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { date, mealType, items } = body

    if (!date || !mealType || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'date, mealType e items son requeridos' },
        { status: 400 }
      )
    }

    // Crear MealLog
    const mealDate = new Date(date)
    const mealLog = await MealLog.create({
      userId: result.user!._id,
      date: mealDate,
      mealType,
    })

    // Crear MealItems
    const mealItems = await Promise.all(
      items.map(async (item: any) => {
        let estimatedKcal = item.estimatedKcal || 0
        let macros = item.macros

        // Si hay foodId, calcular desde el alimento
        if (item.foodId) {
          const food = await Food.findById(item.foodId)
          if (food) {
            const multiplier = item.quantity / 100 // Asumiendo que quantity está en la misma unidad que el food
            estimatedKcal = food.kcalPer100g * multiplier
            macros = {
              protein: food.proteinPer100g ? food.proteinPer100g * multiplier : undefined,
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

    // Populate items
    const populatedItems = await Promise.all(
      mealItems.map(async (item) => {
        await item.populate('foodId')
        return item.toObject()
      })
    )

    return NextResponse.json({
      meal: { ...mealLog.toObject(), items: populatedItems },
    })
  } catch (error: any) {
    console.error('Meals POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

