/**
 * Utilidades para matching inteligente de recetas con items de despensa
 */

interface PantryItem {
  _id: string
  foodId?: any
  customName?: string
  quantity: number
  unit: string
}

interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
}

/**
 * Calcula qué porcentaje de ingredientes de una receta están disponibles en la despensa
 * Retorna un objeto con match percentage y los ingredientes que faltan
 */
export function calculateRecipeMatch(
  recipeIngredients: RecipeIngredient[],
  pantryItems: PantryItem[]
): { matchPercentage: number; missingIngredients: string[]; availableIngredients: string[] } {
  const pantryNames = new Map<string, PantryItem>()
  
  // Normalizar nombres de items de despensa (lowercase para comparación)
  pantryItems.forEach((item) => {
    const name = (item.foodId?.name || item.customName || '').toLowerCase().trim()
    if (name) {
      pantryNames.set(name, item)
    }
  })

  let matchedCount = 0
  const missingIngredients: string[] = []
  const availableIngredients: string[] = []

  recipeIngredients.forEach((ingredient) => {
    const ingName = ingredient.name.toLowerCase().trim()
    
    // Buscar match exacto o parcial
    let found = false
    for (const [pantryName, pantryItem] of pantryNames.entries()) {
      if (pantryName.includes(ingName) || ingName.includes(pantryName)) {
        found = true
        availableIngredients.push(ingredient.name)
        break
      }
    }

    if (found) {
      matchedCount++
    } else {
      missingIngredients.push(ingredient.name)
    }
  })

  const matchPercentage = recipeIngredients.length > 0 
    ? (matchedCount / recipeIngredients.length) * 100 
    : 0

  return {
    matchPercentage,
    missingIngredients,
    availableIngredients,
  }
}

/**
 * Calcula las calorías de una receta ajustada a una cantidad específica de calorías objetivo
 */
export function adjustRecipeCalories(
  baseKcal: number,
  targetKcal: number
): { multiplier: number; adjustedKcal: number } {
  const multiplier = targetKcal / baseKcal
  const adjustedKcal = baseKcal * multiplier

  return {
    multiplier: Math.max(0.5, Math.min(2.0, multiplier)), // Limitar entre 50% y 200%
    adjustedKcal: Math.round(adjustedKcal),
  }
}

/**
 * Genera un título descriptivo para una receta ajustada
 */
export function generateMealTitle(recipeName: string, mealType: string, dayNumber: number): string {
  const mealTypeLabels: Record<string, string> = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    cena: 'Cena',
    snack: 'Snack',
  }

  return `${recipeName} - ${mealTypeLabels[mealType] || mealType}`
}

