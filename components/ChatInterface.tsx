'use client'

import { useState, useEffect, useRef } from 'react'
import { getFirebaseApp } from '@/lib/firebase/client'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const app = await getFirebaseApp()
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth(app)
      const user = auth.currentUser
      if (!user) return

      const token = await user.getIdToken()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ])
        if (data.sessionId) {
          setSessionId(data.sessionId)
        }
      } else {
        const error = await response.json()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${error.error || 'Error al procesar mensaje'}` },
        ])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error al enviar mensaje. Por favor intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] md:h-[600px] bg-white rounded-lg shadow-lg">
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Chat con IA</h2>
        <p className="text-sm text-indigo-100 mt-1">
          Tu asistente nutricional personalizado
        </p>
      </div>

      <div className="bg-yellow-50 border-b border-yellow-200 p-3">
        <p className="text-xs text-yellow-800">
          ⚠️ <strong>Importante:</strong> Este asistente no proporciona consejos médicos.
          Consulta con un profesional de la salud para asesoramiento médico.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>¡Hola! Soy tu asistente nutricional.</p>
            <p className="mt-2">Puedo ayudarte con:</p>
            <ul className="mt-2 text-sm list-disc list-inside">
              <li>Información sobre tu perfil nutricional</li>
              <li>Sugerencias basadas en tu menú semanal</li>
              <li>Alternativas de ingredientes</li>
              <li>Preguntas sobre nutrición</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-gray-600">Pensando...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}

