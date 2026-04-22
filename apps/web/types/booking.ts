export interface StaffSelection {
  id: string
  firstName: string
  lastName: string
  tier: string
  photoUrl?: string | null
}

export interface TimeSlot {
  startAt: string
  endAt: string
  available: boolean
}

export interface BookingDetails {
  service: { id: string; name: string; slug: string }
  staff: StaffSelection
  slot: TimeSlot
  priceUsd: number
  durationMinutes: number
}
