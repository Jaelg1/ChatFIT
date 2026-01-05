'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'

export default function WeeklyMenuView() {
  const [menu, setMenu] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/menu/weekly', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMenu(data.menu)
        }
      } catch (error) {
        console.error('Error fetching menu:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const user = auth.currentUser
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/menu/weekly/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMenu(data.menu)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al generar menú')
      }
    } catch (error) {
      console.error('Error generating menu:', error)
      alert('Error al generar menú')
    } finally {
      setGenerating(false)
    }
  }

  const mealTypeLabels: Record<string, string> = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    cena: 'Cena',
    snack: 'Snack',
  }

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menú Semanal</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? 'Generando...' : 'Generar Menú'}
        </button>
      </div>

      {!menu ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">No hay menú semanal generado</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            {generating ? 'Generando...' : 'Generar Menú Semanal'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {menu.days && menu.days.map((day: any) => {
            const date = new Date(day.date)
            const dayName = dayNames[date.getDay()]

            return (
              <div key={day._id} className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                  {dayName} - {date.toLocaleDateString()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {day.meals && day.meals.map((meal: any) => (
                    <div key={meal._id} className="border rounded-lg p-3 md:p-4">
                      <h4 className="font-semibold mb-2">
                        {mealTypeLabels[meal.mealType] || meal.mealType}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{meal.title}</p>
                      <p className="text-sm font-semibold text-indigo-600">
                        {meal.totalKcal} kcal
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

