const SEVEN_DAYS_MS  = 7  * 24 * 60 * 60 * 1000
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Pure function — no DB calls.
 * Takes a field row and returns 'active' | 'at_risk' | 'completed'
 */
export function computeStatus(field) {
  if (field.stage === 'harvested') return 'completed'

  const now = Date.now()
  const lastUpdate = new Date(field.last_updated_at).getTime()
  const planted    = new Date(field.planting_date).getTime()

  const staleSinceUpdate  = (now - lastUpdate) > SEVEN_DAYS_MS
  const stuckAtPlanting   = (now - planted) > NINETY_DAYS_MS && field.stage === 'planted'
  const stuckAtGrowing    = (now - planted) > NINETY_DAYS_MS && field.stage === 'growing'

  if (staleSinceUpdate || stuckAtPlanting || stuckAtGrowing) return 'at_risk'

  return 'active'
}

/**
 * Attach computed status to a field object (or array of fields).
 */
export function withStatus(fieldOrFields) {
  if (Array.isArray(fieldOrFields)) {
    return fieldOrFields.map(f => ({ ...f, status: computeStatus(f) }))
  }
  return { ...fieldOrFields, status: computeStatus(fieldOrFields) }
}
