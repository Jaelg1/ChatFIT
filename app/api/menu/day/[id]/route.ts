import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import MenuDay from '@/models/MenuDay'
import MenuMeal from '@/models/MenuMeal'
import WeeklyMenu from '@/models/WeeklyMenu'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { meals } = body

    // Verificar que el menú pertenece al usuario
    const menuDay = await MenuDay.findById(params.id).lean()
    if (!menuDay) {
      return NextResponse.json({ error: 'Menu day not found' }, { status: 404 })
    }

    const weeklyMenu = await WeeklyMenu.findById(menuDay.weeklyMenuId).lean()
    if (!weeklyMenu || weeklyMenu.userId.toString() !== result.user!._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Actualizar comidas
    if (meals && Array.isArray(meals)) {
      for (const meal of meals) {
        if (meal._id) {
          await MenuMeal.findByIdAndUpdate(meal._id, {
            title: meal.title,
            recipe: meal.recipe,
            totalKcal: meal.totalKcal,
            locked: meal.locked,
          })
        }
      }
    }

    // Obtener comidas actualizadas
    const updatedMeals = await MenuMeal.find({ menuDayId: params.id }).lean()

    return NextResponse.json({
      day: { ...menuDay, meals: updatedMeals },
    })
  } catch (error: any) {
    console.error('Menu Day PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

