import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import MenuMeal from '@/models/MenuMeal'
import MenuDay from '@/models/MenuDay'
import WeeklyMenu from '@/models/WeeklyMenu'
import PantryItem from '@/models/PantryItem'
import Food from '@/models/Food'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { ingredientIndex, replacementItemId } = body

    // Verificar que el menú pertenece al usuario
    const menuMeal = await MenuMeal.findById(params.id).lean()
    if (!menuMeal) {
      return NextResponse.json({ error: 'Menu meal not found' }, { status: 404 })
    }

    const menuDay = await MenuDay.findById(menuMeal.menuDayId).lean()
    if (!menuDay) {
      return NextResponse.json({ error: 'Menu day not found' }, { status: 404 })
    }

    const weeklyMenu = await WeeklyMenu.findById(menuDay.weeklyMenuId).lean()
    if (!weeklyMenu || weeklyMenu.userId.toString() !== result.user!._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Obtener item de reemplazo de la despensa
    const replacementItem = await PantryItem.findOne({
      _id: replacementItemId,
      userId: result.user!._id,
    })
      .populate('foodId')
      .lean()

    if (!replacementItem) {
      return NextResponse.json(
        { error: 'Replacement item not found in pantry' },
        { status: 404 }
      )
    }

    // Actualizar receta
    const recipe = menuMeal.recipe as any
    if (recipe.ingredients && recipe.ingredients[ingredientIndex]) {
      const oldIngredient = recipe.ingredients[ingredientIndex]
      recipe.ingredients[ingredientIndex] = {
        name: replacementItem.foodId
          ? (replacementItem.foodId as any).name
          : replacementItem.customName,
        quantity: oldIngredient.quantity,
        unit: replacementItem.unit,
      }

      // Recalcular calorías
      let totalKcal = 0
      for (const ing of recipe.ingredients) {
        // Buscar en pantry para calcular calorías
        const pantryItem = await PantryItem.findOne({
          userId: result.user!._id,
          $or: [
            { foodId: { $exists: true } },
            { customName: ing.name },
          ],
        })
          .populate('foodId')
          .lean()

        if (pantryItem?.foodId) {
          const food = pantryItem.foodId as any
          const multiplier = ing.quantity / 100
          totalKcal += food.kcalPer100g * multiplier
        } else {
          totalKcal += 200 * (ing.quantity / 100) // Estimación
        }
      }

      await MenuMeal.findByIdAndUpdate(params.id, {
        recipe,
        totalKcal: Math.round(totalKcal),
      })
    }

    const updatedMeal = await MenuMeal.findById(params.id).lean()

    return NextResponse.json({ meal: updatedMeal })
  } catch (error: any) {
    console.error('Replace ingredient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

