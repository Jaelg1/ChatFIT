'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'

export default function MealsPage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    fetchMeals()
  }, [selectedDate])

  const fetchMeals = async () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const token = await user.getIdToken()
        const response = await fetch(`/api/meals?date=${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMeals(data.meals || [])
        }
      } catch (error) {
        console.error('Error fetching meals:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }

  const mealTypeLabels: Record<string, string> = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    cena: 'Cena',
    snack: 'Snack',
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Registro de Comidas</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {meals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No hay comidas registradas para esta fecha</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <div key={meal._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">
                {mealTypeLabels[meal.mealType] || meal.mealType}
              </h3>
              {meal.items && meal.items.length > 0 ? (
                <ul className="space-y-2">
                  {meal.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span>
                        {item.foodId
                          ? item.foodId.name
                          : item.customName || 'Alimento'}
                        {' - '}
                        {item.quantity} {item.unit}
                      </span>
                      <span className="font-semibold">
                        {item.estimatedKcal?.toFixed(0) || 0} kcal
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Sin items</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

