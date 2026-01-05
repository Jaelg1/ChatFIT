import { Actividad, Objetivo, Sexo } from '@/models/Profile'

type ActivityMultiplier = Record<Actividad, number>

const activityMultipliers: ActivityMultiplier = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  activo: 1.725,
  muy_activo: 1.9,
}

/**
 * Calcula las calorías diarias usando la fórmula de Mifflin-St Jeor
 */
export function calculateDailyCalories(
  peso: number,
  altura: number,
  edad: number,
  sexo: Sexo,
  actividad: Actividad,
  objetivo: Objetivo
): number {
  // TMB (Tasa Metabólica Basal) - Mifflin-St Jeor
  let tmb: number

  if (sexo === 'M') {
    tmb = 10 * peso + 6.25 * altura - 5 * edad + 5
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * edad - 161
  }

  // TDEE (Total Daily Energy Expenditure)
  const multiplier = activityMultipliers[actividad]
  const tdee = tmb * multiplier

  // Ajustar según objetivo
  let targetCalories = tdee

  if (objetivo === 'perder') {
    // Déficit de 500 kcal (aprox. 0.5 kg por semana)
    targetCalories = tdee - 500
  } else if (objetivo === 'ganar') {
    // Superávit de 500 kcal
    targetCalories = tdee + 500
  }
  // Si es 'mantener', usar TDEE directamente

  return Math.round(targetCalories)
}

