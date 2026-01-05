import ProfileForm from '@/components/ProfileForm'
import BackButton from '@/components/BackButton'

export default function ProfilePage() {
  return (
    <div>
      <BackButton href="/dashboard" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Mi Perfil</h1>
      <ProfileForm />
    </div>
  )
}

