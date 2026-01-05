import BMICalculator from '@/components/BMICalculator'
import BackButton from '@/components/BackButton'

export default function BMIPage() {
  return (
    <div>
      <BackButton href="/dashboard" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Calculadora de IMC</h1>
      <BMICalculator />
    </div>
  )
}

