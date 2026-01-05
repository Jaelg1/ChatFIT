import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/middleware/auth'
import connectDB from '@/lib/mongodb/connect'
import ChatSession from '@/models/ChatSession'
import ChatMessage from '@/models/ChatMessage'
import Profile from '@/models/Profile'
import WeeklyMenu from '@/models/WeeklyMenu'
import MenuDay from '@/models/MenuDay'
import MenuMeal from '@/models/MenuMeal'
import PantryItem from '@/models/PantryItem'
import MealLog from '@/models/MealLog'
import { openai } from '@/lib/openai/client'

export async function POST(req: NextRequest) {
  try {
    const result = await verifyFirebaseToken(req)
    if (result.error) return result.error

    await connectDB()

    const body = await req.json()
    const { message, sessionId } = body

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    // Obtener o crear sesión
    let session
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        userId: result.user!._id,
      })
    }

    if (!session) {
      session = await ChatSession.create({
        userId: result.user!._id,
      })
    }

    // Construir contexto
    const profile = await Profile.findOne({ userId: result.user!._id }).lean()

    // Obtener menú semanal actual
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyMenu = await WeeklyMenu.findOne({
      userId: result.user!._id,
      weekStartDate: { $gte: startOfWeek },
    })
      .sort({ weekStartDate: -1 })
      .lean()

    let menuContext: any = null
    if (weeklyMenu) {
      const days = await MenuDay.find({ weeklyMenuId: weeklyMenu._id })
        .sort({ date: 1 })
        .limit(7)
        .lean()

      const daysWithMeals = await Promise.all(
        days.map(async (day) => {
          const meals = await MenuMeal.find({ menuDayId: day._id }).lean()
          return { date: day.date, meals }
        })
      )

      menuContext = {
        weekStartDate: weeklyMenu.weekStartDate,
        targetKcal: weeklyMenu.targetKcal,
        days: daysWithMeals,
      }
    }

    // Obtener despensa
    const pantry = await PantryItem.find({ userId: result.user!._id })
      .populate('foodId')
      .limit(50)
      .lean()

    // Obtener últimas comidas
    const recentMeals = await MealLog.find({ userId: result.user!._id })
      .sort({ date: -1 })
      .limit(5)
      .lean()

    // Construir contexto JSON
    const context = {
      profile: profile
        ? {
            peso: profile.peso,
            altura: profile.altura,
            edad: profile.edad,
            objetivo: profile.objetivo,
            caloriasObjetivo: profile.caloriasObjetivo,
            imcActual: profile.imcActual,
          }
        : null,
      weeklyMenu: menuContext,
      pantry: pantry.map((item) => ({
        name: item.foodId ? (item.foodId as any).name : item.customName,
        quantity: item.quantity,
        unit: item.unit,
      })),
      recentMeals: recentMeals.map((meal) => ({
        date: meal.date,
        mealType: meal.mealType,
      })),
    }

    // Obtener historial de mensajes
    const previousMessages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean()

    // Construir mensajes para OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: `Eres un asistente nutricional inteligente llamado ChatFIT. Tu función es ayudar al usuario con información nutricional, sugerencias de comidas, y seguimiento de su dieta.

IMPORTANTE: NO debes dar consejos médicos. Si el usuario pregunta sobre condiciones médicas, síntomas, o tratamientos, debes recomendarle consultar con un profesional de la salud.

Tienes acceso al siguiente contexto del usuario:
${JSON.stringify(context, null, 2)}

Usa esta información para dar respuestas personalizadas y relevantes. Si el usuario pregunta sobre su menú semanal, despensa, o perfil, usa la información del contexto.`,
      },
    ]

    // Agregar mensajes anteriores
    previousMessages.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      })
    })

    // Agregar mensaje actual del usuario
    messages.push({
      role: 'user',
      content: message,
    })

    // Guardar mensaje del usuario
    await ChatMessage.create({
      sessionId: session._id,
      role: 'user',
      content: message,
    })

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'

    // Guardar respuesta del asistente
    await ChatMessage.create({
      sessionId: session._id,
      role: 'assistant',
      content: assistantMessage,
    })

    return NextResponse.json({
      message: assistantMessage,
      sessionId: session._id.toString(),
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

