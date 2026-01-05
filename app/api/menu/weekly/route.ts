import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import WeeklyMenu from '@/models/WeeklyMenu'
import MenuDay from '@/models/MenuDay'
import MenuMeal from '@/models/MenuMeal'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    // Obtener menú de la semana actual
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyMenu = await WeeklyMenu.findOne({
      userId: result.user!._id,
      weekStartDate: { $gte: startOfWeek },
    })
      .sort({ weekStartDate: -1 })
      .lean()

    if (!weeklyMenu) {
      return NextResponse.json({ menu: null })
    }

    // Obtener días del menú
    const days = await MenuDay.find({ weeklyMenuId: weeklyMenu._id })
      .sort({ date: 1 })
      .lean()

    // Obtener comidas de cada día
    const daysWithMeals = await Promise.all(
      days.map(async (day) => {
        const meals = await MenuMeal.find({ menuDayId: day._id })
          .sort({ mealType: 1 })
          .lean()
        return { ...day, meals }
      })
    )

    return NextResponse.json({
      menu: { ...weeklyMenu, days: daysWithMeals },
    })
  } catch (error: any) {
    console.error('Weekly Menu GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

