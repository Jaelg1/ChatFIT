import { CategoriaIMC } from '@/models/BMIHistory'

export function calculateBMI(peso: number, altura: number): number {
  // Altura en metros
  const alturaMetros = altura / 100
  const bmi = peso / (alturaMetros * alturaMetros)
  return Math.round(bmi * 10) / 10 // Redondear a 1 decimal
}

export function getBMICategory(bmi: number): CategoriaIMC {
  if (bmi < 18.5) {
    return 'bajo_peso'
  } else if (bmi < 25) {
    return 'normal'
  } else if (bmi < 30) {
    return 'sobrepeso'
  } else {
    return 'obesidad'
  }
}

export function getBMICategoryLabel(categoria: CategoriaIMC): string {
  const labels: Record<CategoriaIMC, string> = {
    bajo_peso: 'Bajo peso',
    normal: 'Normal',
    sobrepeso: 'Sobrepeso',
    obesidad: 'Obesidad',
  }
  return labels[categoria]
}

