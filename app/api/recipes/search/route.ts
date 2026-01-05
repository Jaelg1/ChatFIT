import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import Recipe from '@/models/Recipe'
import PantryItem from '@/models/PantryItem'
import { calculateRecipeMatch } from '@/lib/utils/recipe-matching'
import { MealType } from '@/models/MealLog'

/**
 * Endpoint para buscar recetas que coincidan con los items de la despensa
 */
export async function GET(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const { searchParams } = new URL(req.url)
    const mealType = searchParams.get('mealType') as MealType | null
    const minMatch = parseFloat(searchParams.get('minMatch') || '50')

    // Obtener items de despensa
    const pantryItemsRaw = await PantryItem.find({ userId: result.user!._id })
      .populate('foodId')
      .lean()

    const pantryItems = pantryItemsRaw.map((item) => ({
      _id: item._id.toString(),
      foodId: item.foodId,
      customName: item.customName,
      quantity: item.quantity,
      unit: item.unit,
      name: item.foodId ? (item.foodId as any).name : item.customName || '',
    }))

    // Buscar recetas
    let query: any = {}
    if (mealType) {
      query.mealType = mealType
    }

    const recipes = await Recipe.find(query).lean()

    // Calcular match para cada receta
    const recipesWithMatch = recipes.map((recipe) => {
      const match = calculateRecipeMatch(recipe.ingredients, pantryItems)
      return {
        ...recipe,
        match: match.matchPercentage,
        missingIngredients: match.missingIngredients,
        availableIngredients: match.availableIngredients,
      }
    })

    // Filtrar por match mínimo y ordenar por mejor match
    const filteredRecipes = recipesWithMatch
      .filter((r) => r.match >= minMatch)
      .sort((a, b) => b.match - a.match)

    return NextResponse.json({
      recipes: filteredRecipes,
      total: filteredRecipes.length,
    })
  } catch (error: any) {
    console.error('Search recipes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

