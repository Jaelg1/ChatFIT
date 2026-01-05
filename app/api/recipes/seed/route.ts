import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import Recipe from '@/models/Recipe'

/**
 * Endpoint para crear recetas base de ejemplo
 * Solo debe ejecutarse una vez para poblar la base de datos
 */
export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    // Verificar si ya existen recetas
    const existingRecipes = await Recipe.countDocuments()
    if (existingRecipes > 0) {
      return NextResponse.json({
        message: 'Ya existen recetas en la base de datos',
        count: existingRecipes,
      })
    }

    // Recetas base inspiradas en Paulina Cocina y Cookpad
    // Referencias: https://www.paulinacocina.net/ y https://cookpad.com/ar/
    const baseRecipes = [
      // DESAYUNOS
      {
        name: 'Avena con Frutas',
        description: 'Avena cocida con frutas frescas - estilo saludable',
        mealType: 'desayuno' as const,
        ingredients: [
          { name: 'Avena', quantity: 50, unit: 'g', kcalPer100g: 389 },
          { name: 'Plátano', quantity: 1, unit: 'unidades', kcalPer100g: 89 },
        ],
        totalKcal: 280,
        servings: 1,
        kcalPerServing: 280,
        macros: { protein: 8, carbs: 50, fat: 5 },
        tags: ['saludable', 'rico en fibra'],
      },
      {
        name: 'Huevos Revueltos con Verduras',
        description: 'Huevos revueltos con tomate y cebolla - receta casera fácil',
        mealType: 'desayuno' as const,
        ingredients: [
          { name: 'Huevos', quantity: 2, unit: 'unidades', kcalPer100g: 155 },
          { name: 'Tomate', quantity: 1, unit: 'unidades', kcalPer100g: 18 },
          { name: 'Cebolla', quantity: 0.25, unit: 'unidades', kcalPer100g: 40 },
        ],
        totalKcal: 320,
        servings: 1,
        kcalPerServing: 320,
        macros: { protein: 20, carbs: 8, fat: 22 },
        tags: ['rico en proteínas', 'fácil'],
      },
      {
        name: 'Panqueques Saludables',
        description: 'Panqueques caseros ligeros - inspirado en recetas populares',
        mealType: 'desayuno' as const,
        ingredients: [
          { name: 'Huevos', quantity: 1, unit: 'unidades', kcalPer100g: 155 },
          { name: 'Avena', quantity: 30, unit: 'g', kcalPer100g: 389 },
          { name: 'Plátano', quantity: 0.5, unit: 'unidades', kcalPer100g: 89 },
        ],
        totalKcal: 250,
        servings: 1,
        kcalPerServing: 250,
        macros: { protein: 12, carbs: 35, fat: 8 },
        tags: ['saludable', 'sin harina'],
      },
      
      // ALMUERZOS
      {
        name: 'Arroz Integral con Pollo y Verduras',
        description: 'Arroz integral con pechuga de pollo y verduras salteadas',
        mealType: 'almuerzo' as const,
        ingredients: [
          { name: 'Arroz Integral', quantity: 100, unit: 'g', kcalPer100g: 123 },
          { name: 'Pechugas de pollo', quantity: 150, unit: 'g', kcalPer100g: 165 },
          { name: 'Zanahorias', quantity: 100, unit: 'g', kcalPer100g: 41 },
        ],
        totalKcal: 430,
        servings: 1,
        kcalPerServing: 430,
        macros: { protein: 35, carbs: 45, fat: 8 },
        tags: ['rico en proteínas', 'completo'],
      },
      {
        name: 'Lentejas con Verduras',
        description: 'Guiso de lentejas con verduras - receta tradicional',
        mealType: 'almuerzo' as const,
        ingredients: [
          { name: 'Lentejas', quantity: 100, unit: 'g', kcalPer100g: 116 },
          { name: 'Cebolla', quantity: 0.5, unit: 'unidades', kcalPer100g: 40 },
          { name: 'Zanahorias', quantity: 100, unit: 'g', kcalPer100g: 41 },
        ],
        totalKcal: 280,
        servings: 1,
        kcalPerServing: 280,
        macros: { protein: 18, carbs: 45, fat: 2 },
        tags: ['vegetariano', 'rico en proteínas', 'rico en fibra'],
      },
      {
        name: 'Pollo al Horno con Verduras',
        description: 'Pollo al horno con verduras asadas - receta casera fácil',
        mealType: 'almuerzo' as const,
        ingredients: [
          { name: 'Pechugas de pollo', quantity: 150, unit: 'g', kcalPer100g: 165 },
          { name: 'Zanahorias', quantity: 150, unit: 'g', kcalPer100g: 41 },
          { name: 'Cebolla', quantity: 0.5, unit: 'unidades', kcalPer100g: 40 },
        ],
        totalKcal: 380,
        servings: 1,
        kcalPerServing: 380,
        macros: { protein: 32, carbs: 25, fat: 15 },
        tags: ['rico en proteínas', 'fácil'],
      },
      {
        name: 'Ensalada Completa con Pollo',
        description: 'Ensalada mixta con pollo, verduras y legumbres',
        mealType: 'almuerzo' as const,
        ingredients: [
          { name: 'Pechugas de pollo', quantity: 120, unit: 'g', kcalPer100g: 165 },
          { name: 'Lechuga', quantity: 100, unit: 'g', kcalPer100g: 15 },
          { name: 'Tomate', quantity: 1, unit: 'unidades', kcalPer100g: 18 },
          { name: 'Zanahorias', quantity: 50, unit: 'g', kcalPer100g: 41 },
        ],
        totalKcal: 280,
        servings: 1,
        kcalPerServing: 280,
        macros: { protein: 28, carbs: 15, fat: 12 },
        tags: ['ligero', 'rico en proteínas', 'saludable'],
      },
      
      // CENAS
      {
        name: 'Ensalada de Pollo Ligera',
        description: 'Ensalada mixta con pollo a la plancha - cena ligera',
        mealType: 'cena' as const,
        ingredients: [
          { name: 'Pechugas de pollo', quantity: 100, unit: 'g', kcalPer100g: 165 },
          { name: 'Lechuga', quantity: 100, unit: 'g', kcalPer100g: 15 },
          { name: 'Tomate', quantity: 1, unit: 'unidades', kcalPer100g: 18 },
        ],
        totalKcal: 220,
        servings: 1,
        kcalPerServing: 220,
        macros: { protein: 24, carbs: 8, fat: 8 },
        tags: ['ligero', 'rico en proteínas'],
      },
      {
        name: 'Omelet de Verduras',
        description: 'Tortilla de huevos con verduras - cena rápida y nutritiva',
        mealType: 'cena' as const,
        ingredients: [
          { name: 'Huevos', quantity: 2, unit: 'unidades', kcalPer100g: 155 },
          { name: 'Zanahorias', quantity: 50, unit: 'g', kcalPer100g: 41 },
          { name: 'Cebolla', quantity: 0.25, unit: 'unidades', kcalPer100g: 40 },
        ],
        totalKcal: 290,
        servings: 1,
        kcalPerServing: 290,
        macros: { protein: 18, carbs: 12, fat: 18 },
        tags: ['ligero', 'rico en proteínas', 'fácil'],
      },
      {
        name: 'Sopa de Verduras con Pollo',
        description: 'Sopa casera de verduras con pollo - reconfortante y ligera',
        mealType: 'cena' as const,
        ingredients: [
          { name: 'Pechugas de pollo', quantity: 80, unit: 'g', kcalPer100g: 165 },
          { name: 'Zanahorias', quantity: 100, unit: 'g', kcalPer100g: 41 },
          { name: 'Cebolla', quantity: 0.5, unit: 'unidades', kcalPer100g: 40 },
        ],
        totalKcal: 200,
        servings: 1,
        kcalPerServing: 200,
        macros: { protein: 20, carbs: 15, fat: 6 },
        tags: ['ligero', 'saludable', 'reconfortante'],
      },
      
      // SNACKS
      {
        name: 'Yogur con Frutas',
        description: 'Yogur natural con frutas - snack saludable',
        mealType: 'snack' as const,
        ingredients: [
          { name: 'Yogur', quantity: 150, unit: 'g', kcalPer100g: 59 },
          { name: 'Plátano', quantity: 0.5, unit: 'unidades', kcalPer100g: 89 },
        ],
        totalKcal: 150,
        servings: 1,
        kcalPerServing: 150,
        macros: { protein: 8, carbs: 25, fat: 2 },
        tags: ['saludable'],
      },
      {
        name: 'Huevos Cocidos',
        description: 'Huevos duros - snack proteico y saciante',
        mealType: 'snack' as const,
        ingredients: [
          { name: 'Huevos', quantity: 2, unit: 'unidades', kcalPer100g: 155 },
        ],
        totalKcal: 140,
        servings: 1,
        kcalPerServing: 140,
        macros: { protein: 12, carbs: 1, fat: 10 },
        tags: ['rico en proteínas', 'fácil'],
      },
      {
        name: 'Verduras Crudas con Hummus',
        description: 'Zanahorias y tomates con hummus casero',
        mealType: 'snack' as const,
        ingredients: [
          { name: 'Zanahorias', quantity: 100, unit: 'g', kcalPer100g: 41 },
          { name: 'Tomate', quantity: 1, unit: 'unidades', kcalPer100g: 18 },
        ],
        totalKcal: 80,
        servings: 1,
        kcalPerServing: 80,
        macros: { protein: 2, carbs: 15, fat: 1 },
        tags: ['saludable', 'vegetariano'],
      },
    ]

    const createdRecipes = await Recipe.insertMany(baseRecipes)

    return NextResponse.json({
      message: `${createdRecipes.length} recetas creadas exitosamente`,
      recipes: createdRecipes.map((r) => ({
        id: r._id,
        name: r.name,
        mealType: r.mealType,
      })),
    })
  } catch (error: any) {
    console.error('Seed recipes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

