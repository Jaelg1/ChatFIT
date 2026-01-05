'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import { calculateBMI, getBMICategory, getBMICategoryLabel } from '@/lib/utils/bmi'
import { CategoriaIMC } from '@/models/BMIHistory'

export default function BMICalculator() {
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [categoria, setCategoria] = useState<CategoriaIMC | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/bmi/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setHistory(data.history || [])
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      }
    })

    return () => unsubscribe()
  }

  const handleCalculate = async () => {
    if (!peso || !altura) {
      alert('Por favor ingresa peso y altura')
      return
    }

    const calculatedBMI = calculateBMI(parseFloat(peso), parseFloat(altura))
    const calculatedCategory = getBMICategory(calculatedBMI)

    setBmi(calculatedBMI)
    setCategoria(calculatedCategory)

    // Guardar en backend
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('/api/bmi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          peso: parseFloat(peso),
          altura: parseFloat(altura),
        }),
      })

      if (response.ok) {
        await fetchHistory()
      }
    } catch (error) {
      console.error('Error saving BMI:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Calculadora de IMC</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Calculando...' : 'Calcular IMC'}
        </button>

        {bmi !== null && categoria && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600 mb-2">
              IMC: {bmi.toFixed(1)}
            </p>
            <p className="text-lg text-gray-700">
              Categoría: {getBMICategoryLabel(categoria)}
            </p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Historial de IMC</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Peso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Altura
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IMC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((entry) => (
                  <tr key={entry._id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.peso} kg</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.altura} cm</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {entry.imc.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getBMICategoryLabel(entry.categoria)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

