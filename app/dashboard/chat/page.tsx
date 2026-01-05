import ChatInterface from '@/components/ChatInterface'
import BackButton from '@/components/BackButton'

export default function ChatPage() {
  return (
    <div>
      <BackButton href="/dashboard" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Chat con IA</h1>
      <ChatInterface />
    </div>
  )
}

