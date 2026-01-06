'use client'

import { useEffect, useState } from 'react'
import { getFirebaseApp } from '@/lib/firebase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const fetchData = async () => {
      const app = await getFirebaseApp()
      const { getAuth, onAuthStateChanged } = await import('firebase/auth')
      const auth = getAuth(app)
      
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return

        try {
          const token = await user.getIdToken()
          const response = await fetch('/api/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setProfile(data.profile)
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setLoading(false)
        }
      })
    }

    fetchData()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Dashboard</h1>

      {!profile ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Completa tu perfil
          </h2>
          <p className="text-yellow-700 mb-4">
            Para comenzar, necesitas completar tu perfil con tu información básica.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Ir a Perfil
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">IMC Actual</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {profile.imcActual?.toFixed(1) || 'N/A'}
            </p>
            <Link
              href="/dashboard/bmi"
              className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
            >
              Ver historial →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">Calorías Objetivo</h3>
            <p className="text-3xl font-bold text-green-600">
              {profile.caloriasObjetivo || 'N/A'} kcal
            </p>
            <Link
              href="/dashboard/profile"
              className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
            >
              Actualizar →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">Objetivo</h3>
            <p className="text-lg text-gray-600 capitalize">
              {profile.objetivo || 'No definido'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Link
          href="/dashboard/pantry"
          className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg md:text-xl font-semibold mb-2">🥫 Gestionar Despensa</h3>
          <p className="text-sm md:text-base text-gray-600">Administra los alimentos disponibles</p>
        </Link>

        <Link
          href="/dashboard/menu"
          className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg md:text-xl font-semibold mb-2">📅 Menú Semanal</h3>
          <p className="text-sm md:text-base text-gray-600">Genera y gestiona tu menú semanal</p>
        </Link>

        <Link
          href="/dashboard/chat"
          className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg md:text-xl font-semibold mb-2">💬 Chat con IA</h3>
          <p className="text-sm md:text-base text-gray-600">Consulta a tu asistente nutricional</p>
        </Link>
      </div>
    </div>
  )
}

