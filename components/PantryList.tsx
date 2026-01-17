'use client'

import { useState, useEffect } from 'react'
import { getFirebaseApp } from '@/lib/firebase/client'

export default function PantryList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    customName: '',
    quantity: '',
    unit: 'g',
    expiryDate: '',
  })
  const [editFormData, setEditFormData] = useState({
    quantity: '',
    unit: '',
    expiryDate: '',
  })

  const fetchItems = async (userOverride?: any) => {
    try {
      const app = await getFirebaseApp()
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth(app)
      const user = userOverride || auth.currentUser
      if (!user) {
        setLoading(false)
        return
      }

      const token = await user.getIdToken()
      const response = await fetch('/api/pantry', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const init = async () => {
      const app = await getFirebaseApp()
      const { getAuth, onAuthStateChanged } = await import('firebase/auth')
      const auth = getAuth(app)

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setLoading(false)
          return
        }
        await fetchItems(user)
      })

      if (auth.currentUser) {
        await fetchItems(auth.currentUser)
      }
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const app = await getFirebaseApp()
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth(app)
    const user = auth.currentUser
    if (!user) return

    if (!formData.customName || !formData.quantity) {
      alert('Por favor completa el nombre y la cantidad')
      return
    }

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customName: formData.customName,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          expiryDate: formData.expiryDate || undefined,
        }),
      })

      if (response.ok) {
        await fetchItems()
        setShowAddForm(false)
        setFormData({
          customName: '',
          quantity: '',
          unit: 'g',
          expiryDate: '',
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al agregar item')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Error al agregar item')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setEditFormData({
      quantity: item.quantity.toString(),
      unit: item.unit,
      expiryDate: item.expiryDate
        ? new Date(item.expiryDate).toISOString().split('T')[0]
        : '',
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const app = await getFirebaseApp()
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth(app)
    const user = auth.currentUser
    if (!user || !editingItem) return

    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/pantry/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: parseFloat(editFormData.quantity),
          unit: editFormData.unit,
          expiryDate: editFormData.expiryDate || undefined,
        }),
      })

      if (response.ok) {
        await fetchItems()
        setEditingItem(null)
        setEditFormData({
          quantity: '',
          unit: '',
          expiryDate: '',
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Error al actualizar item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return

    const app = await getFirebaseApp()
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth(app)
    const user = auth.currentUser
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/pantry/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchItems()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error al eliminar item')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mi Despensa</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {showAddForm ? 'Cancelar' : '+ Agregar Item'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Agregar Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del alimento *
              </label>
              <input
                type="text"
                required
                value={formData.customName}
                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Arroz Integral"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="g, kg, unidades, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Agregar
          </button>
        </form>
      )}

      {/* Formulario de edición */}
      {editingItem && (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Editar: {editingItem.foodId ? editingItem.foodId.name : editingItem.customName}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setEditFormData({ quantity: '', unit: '', expiryDate: '' })
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={editFormData.quantity}
                onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <input
                type="text"
                required
                value={editFormData.unit}
                onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="g, kg, unidades, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={editFormData.expiryDate}
                onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setEditFormData({ quantity: '', unit: '', expiryDate: '' })
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 md:p-6 text-center">
          <p className="text-gray-600">No hay items en la despensa</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alimento
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                  Vencimiento
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-900">
                    {item.foodId ? item.foodId.name : item.customName}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-900 hidden sm:table-cell">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

