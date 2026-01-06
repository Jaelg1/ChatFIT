'use client'

import { useState, useEffect } from 'react'
import { getFirebaseApp } from '@/lib/firebase/client'

export default function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    peso: '',
    altura: '',
    edad: '',
    sexo: '',
    actividad: '',
    objetivo: '',
  })
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const fetchProfile = async () => {
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
            if (data.profile) {
              setProfile(data.profile)
              setFormData({
                peso: data.profile.peso?.toString() || '',
                altura: data.profile.altura?.toString() || '',
                edad: data.profile.edad?.toString() || '',
                sexo: data.profile.sexo || '',
                actividad: data.profile.actividad || '',
                objetivo: data.profile.objetivo || '',
              })
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      })
    }

    fetchProfile()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    try {
      const app = await getFirebaseApp()
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth(app)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          peso: parseFloat(formData.peso),
          altura: parseFloat(formData.altura),
          edad: parseInt(formData.edad),
          sexo: formData.sexo || undefined,
          actividad: formData.actividad || undefined,
          objetivo: formData.objetivo || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar perfil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error al guardar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">Perfil Nutricional</h2>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Perfil guardado exitosamente
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg) *
          </label>
          <input
            type="number"
            step="0.1"
            required
            value={formData.peso}
            onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            required
            value={formData.altura}
            onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad (años) *
          </label>
          <input
            type="number"
            required
            value={formData.edad}
            onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select
            value={formData.sexo}
            onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Actividad
          </label>
          <select
            value={formData.actividad}
            onChange={(e) => setFormData({ ...formData, actividad: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar</option>
            <option value="sedentario">Sedentario</option>
            <option value="ligero">Ligero</option>
            <option value="moderado">Moderado</option>
            <option value="activo">Activo</option>
            <option value="muy_activo">Muy Activo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo
          </label>
          <select
            value={formData.objetivo}
            onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar</option>
            <option value="perder">Perder peso</option>
            <option value="mantener">Mantener peso</option>
            <option value="ganar">Ganar peso</option>
          </select>
        </div>
      </div>

      {profile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>IMC Actual:</strong> {profile.imcActual?.toFixed(1) || 'N/A'}
          </p>
          {profile.caloriasObjetivo && (
            <p className="text-sm text-gray-600">
              <strong>Calorías Objetivo:</strong> {profile.caloriasObjetivo} kcal/día
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar Perfil'}
      </button>
    </form>
  )
}

