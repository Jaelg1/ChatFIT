import PantryList from '@/components/PantryList'
import BackButton from '@/components/BackButton'

export default function PantryPage() {
  return (
    <div>
      <BackButton href="/dashboard" />
      <PantryList />
    </div>
  )
}

