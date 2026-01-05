import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import WeeklyMenu from '@/models/WeeklyMenu'
import MenuDay from '@/models/MenuDay'
import MenuMeal from '@/models/MenuMeal'
import PantryItem from '@/models/PantryItem'
import Profile from '@/models/Profile'
import Recipe from '@/models/Recipe'
import { MealType } from '@/models/MealLog'
import { calculateRecipeMatch, adjustRecipeCalories, generateMealTitle } from '@/lib/utils/recipe-matching'
import { openai } from '@/lib/openai/client'

interface PantryItemWithName {
  _id: string
  foodId?: any
  customName?: string
  quantity: number
  unit: string
  name: string
}

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    // Obtener perfil para calorías objetivo
    const profile = await Profile.findOne({ userId: result.user!._id }).lean()
    if (!profile || !profile.caloriasObjetivo) {
      return NextResponse.json(
        { error: 'Perfil incompleto. Completa tu perfil primero.' },
        { status: 400 }
      )
    }

    // Obtener items de despensa con nombres normalizados
    const pantryItemsRaw = await PantryItem.find({ userId: result.user!._id })
      .populate('foodId')
      .lean()

    const pantryItems: PantryItemWithName[] = pantryItemsRaw.map((item) => ({
      _id: item._id.toString(),
      foodId: item.foodId,
      customName: item.customName,
      quantity: item.quantity,
      unit: item.unit,
      name: item.foodId ? (item.foodId as any).name : item.customName || '',
    }))

    if (pantryItems.length === 0) {
      return NextResponse.json(
        { error: 'No hay items en la despensa. Agrega alimentos primero.' },
        { status: 400 }
      )
    }

    // Calcular calorías por comida según objetivo
    const targetKcal = profile.caloriasObjetivo
    const kcalPerMeal = {
      desayuno: Math.round(targetKcal * 0.25),
      almuerzo: Math.round(targetKcal * 0.35),
      cena: Math.round(targetKcal * 0.30),
      snack: Math.round(targetKcal * 0.10),
    }

    // Calcular inicio de semana (domingo)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Eliminar menú anterior de esta semana si existe
    const existingMenu = await WeeklyMenu.findOne({
      userId: result.user!._id,
      weekStartDate: { $gte: startOfWeek },
    })

    if (existingMenu) {
      const existingDays = await MenuDay.find({ weeklyMenuId: existingMenu._id })
      const existingDayIds = existingDays.map((d) => d._id)
      await MenuMeal.deleteMany({ menuDayId: { $in: existingDayIds } })
      await MenuDay.deleteMany({ weeklyMenuId: existingMenu._id })
      await WeeklyMenu.deleteOne({ _id: existingMenu._id })
    }

    // Crear WeeklyMenu
    const weeklyMenu = await WeeklyMenu.create({
      userId: result.user!._id,
      weekStartDate: startOfWeek,
      targetKcal,
    })

    // Obtener todas las recetas disponibles
    const allRecipes = await Recipe.find().lean()
    
    // Generar menú para 7 días
    const mealTypes: MealType[] = ['desayuno', 'almuerzo', 'cena', 'snack']
    const days: any[] = []
    const usedRecipeIds = new Set<string>() // Para variar las recetas

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + i)

      const menuDay = await MenuDay.create({
        weeklyMenuId: weeklyMenu._id,
        date: dayDate,
      })

      const meals: any[] = []

      // Generar comidas para cada tipo
      for (const mealType of mealTypes) {
        const targetKcalForMeal = kcalPerMeal[mealType]

        // Filtrar recetas por tipo de comida
        const recipesForMealType = allRecipes.filter((r) => r.mealType === mealType)

        // Buscar receta con mejor match
        let bestRecipe: any = null
        let bestMatch = { matchPercentage: 0, missingIngredients: [] as string[], availableIngredients: [] as string[] }

        for (const recipe of recipesForMealType) {
          // Evitar repetir recetas muy recientes (permitir algunas repeticiones)
          if (usedRecipeIds.has(recipe._id.toString()) && Math.random() > 0.3) {
            continue
          }

          const match = calculateRecipeMatch(recipe.ingredients, pantryItems)
          
          // Preferir recetas con 70%+ de match
          if (match.matchPercentage >= bestMatch.matchPercentage) {
            bestRecipe = recipe
            bestMatch = match
          }
        }

        let mealTitle: string
        let recipe: any
        let totalKcal: number

        // Si encontramos una receta con buen match (50%+), usarla
        if (bestRecipe && bestMatch.matchPercentage >= 50) {
          usedRecipeIds.add(bestRecipe._id.toString())
          
          // Ajustar calorías de la receta al objetivo
          const adjusted = adjustRecipeCalories(bestRecipe.kcalPerServing, targetKcalForMeal)
          
          // Ajustar ingredientes según el multiplicador
          const adjustedIngredients = bestRecipe.ingredients.map((ing: any) => ({
            name: ing.name,
            quantity: Math.round(ing.quantity * adjusted.multiplier * 10) / 10,
            unit: ing.unit,
          }))

          recipe = {
            ingredients: adjustedIngredients,
            instructions: `Ajusta las cantidades según tus necesidades. Esta receta base de "${bestRecipe.name}" ha sido ajustada para cumplir con ${targetKcalForMeal} kcal.`,
          }

          totalKcal = adjusted.adjustedKcal
          mealTitle = bestRecipe.name
        } else {
          // No hay buena receta, generar una con OpenAI
          const pantryNames = pantryItems.map((item) => item.name).join(', ')
          
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Eres un nutricionista experto y chef casero. Genera recetas saludables, fáciles y caseras basadas en ingredientes disponibles.
Inspírate en el estilo de recetas de sitios como Paulina Cocina (https://www.paulinacocina.net/) y Cookpad (https://cookpad.com/ar/): recetas prácticas, caseras, con ingredientes comunes y fáciles de preparar.

Responde SOLO con un JSON válido con esta estructura:
{
  "name": "Nombre de la receta (atractivo y descriptivo)",
  "ingredients": [
    {"name": "Nombre ingrediente", "quantity": cantidad, "unit": "unidad"}
  ],
  "instructions": "Instrucciones de preparación breves y claras (2-3 pasos)",
  "totalKcal": número de calorías estimadas
}

El objetivo del usuario es ${profile.objetivo === 'perder' ? 'perder peso (receta ligera y nutritiva)' : profile.objetivo === 'ganar' ? 'ganar peso (receta más calórica y nutritiva)' : 'mantener peso (receta balanceada)'}.
Las calorías objetivo para esta comida son ${targetKcalForMeal} kcal.
Genera una receta de tipo ${mealType} que sea:
- Fácil de preparar
- Con ingredientes comunes y accesibles
- Deliciosa y casera
- Apropiada para el objetivo nutricional del usuario`,
              },
              {
                role: 'user',
                content: `Genera una receta casera y fácil usando estos ingredientes disponibles: ${pantryNames}. 
La receta debe tener aproximadamente ${targetKcalForMeal} kcal.
Puedes usar ingredientes básicos comunes (aceite de oliva, sal, pimienta, ajo, etc.) además de los ingredientes listados.
Haz que sea una receta práctica, deliciosa y que cualquier persona pueda hacer en casa.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          })

          const content = openaiResponse.choices[0]?.message?.content || '{}'
          let generatedRecipe: any

          try {
            // Extraer JSON de la respuesta (puede venir con markdown)
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              generatedRecipe = JSON.parse(jsonMatch[0])
            } else {
              generatedRecipe = JSON.parse(content)
            }
          } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError)
            // Fallback a receta simple
            generatedRecipe = {
              name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} personalizado`,
              ingredients: pantryItems.slice(0, 3).map((item) => ({
                name: item.name,
                quantity: Math.round(item.quantity * 0.3),
                unit: item.unit,
              })),
              instructions: 'Prepara según tus preferencias',
              totalKcal: targetKcalForMeal,
            }
          }

          recipe = {
            ingredients: generatedRecipe.ingredients || [],
            instructions: generatedRecipe.instructions || 'Prepara según tus preferencias',
          }

          totalKcal = generatedRecipe.totalKcal || targetKcalForMeal
          mealTitle = generatedRecipe.name || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} personalizado`
        }

        const menuMeal = await MenuMeal.create({
          menuDayId: menuDay._id,
          mealType,
          title: mealTitle,
          recipe,
          totalKcal: Math.round(totalKcal),
          locked: false,
        })

        meals.push(menuMeal.toObject())
      }

      days.push({
        ...menuDay.toObject(),
        meals,
      })
    }

    return NextResponse.json({
      menu: {
        ...weeklyMenu.toObject(),
        days,
      },
    })
  } catch (error: any) {
    console.error('Generate Menu error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
