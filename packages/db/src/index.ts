// Re-export the Prisma client singleton
export { db } from "./client";

// Re-export all repository helpers
export * from "./repositories";

// Re-export Prisma types so consumers don't need to import from @prisma/client directly
export type {
  User,
  Staff,
  StaffSchedule,
  Service,
  ServicePricing,
  Appointment,
  AppointmentWaitlist,
  Role,
  StaffTier,
  ScheduleType,
  AppointmentStatus,
  CancelledBy,
  WaitlistStatus,
  PaymentGateway,
  PaymentStatus,
  PaymentMethod,
  RelatedEntity,
  DiscountType,
  CouponScope,
  MembershipStatus,
  BillingCycle,
  ClientPackageStatus,
  AdCampaignStatus,
  NotificationChannel,
  PreferredLocale,
} from "@prisma/client";
