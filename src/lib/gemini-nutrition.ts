import type { NutritionPlan } from '@/types/nutrition-plan'
import { isNutritionPlanComplete } from '@/types/nutrition-plan'
import type { UserProfile } from '@/types/user-profile'

const GEMINI_MODEL = 'gemini-3-flash-preview'

function getAgeYears(profile: UserProfile): number {
  const today = new Date()
  let age = today.getFullYear() - profile.birthYear
  const monthDelta = today.getMonth() + 1 - profile.birthMonth
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < profile.birthDay)
  ) {
    age -= 1
  }
  return age
}

function goalLabel(goal: UserProfile['goal']): string {
  switch (goal) {
    case 'lose':
      return 'lose weight'
    case 'gain':
      return 'gain muscle / weight'
    default:
      return 'maintain weight'
  }
}

function buildPrompt(profile: UserProfile): string {
  const age = getAgeYears(profile)
  return `You are a certified sports nutrition assistant. Based on the user profile below, calculate personalized daily targets.

User profile:
- Gender: ${profile.gender}
- Age: ${age} years
- Height: ${profile.heightCm} cm
- Weight: ${profile.weightKg} kg
- Goal: ${goalLabel(profile.goal)}
- Workout frequency: ${profile.workoutFrequency} days per week

Return ONLY valid JSON with these exact keys (numbers must be realistic integers or one decimal for weeklyWeightChangeKg):
{
  "dailyCalories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "fiberG": number,
  "waterMl": number,
  "stepsGoal": number,
  "activeMinutesGoal": number,
  "sleepHoursGoal": number,
  "bmr": number,
  "tdee": number,
  "weeklyWeightChangeKg": number,
  "sodiumMaxMg": number,
  "sugarMaxG": number,
  "summary": "2-3 sentence plain-language explanation of the plan"
}

Rules:
- Macros must sum sensibly with dailyCalories (protein/carbs ~4 kcal/g, fat ~9 kcal/g).
- weeklyWeightChangeKg: negative for loss, positive for gain, near 0 for maintain.
- waterMl: daily hydration in milliliters.
- Do not include markdown or extra keys.`
}

function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(raw) as unknown
}

export async function generateNutritionPlanWithGemini(
  profile: UserProfile,
): Promise<NutritionPlan> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.',
    )
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20_000)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(profile) }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(
      `Gemini request failed (${response.status}): ${errText.slice(0, 200)}`,
    )
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  const parsed = parseGeminiJson(text) as Partial<NutritionPlan>
  if (!isNutritionPlanComplete(parsed)) {
    throw new Error(
      'Gemini response did not match the expected nutrition plan shape.',
    )
  }

  return parsed
}
