import WeeklyMenuView from '@/components/WeeklyMenuView'
import BackButton from '@/components/BackButton'

export default function MenuPage() {
  return (
    <div>
      <BackButton href="/dashboard" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Menú Semanal</h1>
      <WeeklyMenuView />
    </div>
  )
}

