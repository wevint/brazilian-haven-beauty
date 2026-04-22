/**
 * tRPC router: admin
 * Provides KPI summaries and dashboard stats for the admin dashboard.
 */

import { router, adminProcedure } from "../trpc";
import { prisma } from "@bhb/db";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export const adminRouter = router({
  /**
   * Returns high-level dashboard stats for today.
   */
  getDashboardStats: adminProcedure.query(async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Count today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
      },
    });

    // Sum revenue from completed appointments today (priceUsd in cents)
    const revenueResult = await prisma.appointment.aggregate({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        status: "completed",
      },
      _sum: { priceUsd: true },
    });
    const revenue = revenueResult._sum.priceUsd ?? 0;

    // Count distinct clients with appointments in last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentAppointments = await prisma.appointment.findMany({
      where: { startAt: { gte: thirtyDaysAgo } },
      select: { clientId: true },
    });
    const activeClients = new Set(recentAppointments.map((a) => a.clientId)).size;

    return { todayAppointments, revenue, activeClients };
  }),

  /**
   * Returns KPI summary data for the admin dashboard.
   */
  getKpiSummary: adminProcedure.query(async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // appointmentsToday
    const appointmentsToday = await prisma.appointment.count({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
      },
    });

    // revenueToday: sum of priceUsd for completed appointments today
    const revenueResult = await prisma.appointment.aggregate({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        status: "completed",
      },
      _sum: { priceUsd: true },
    });
    const revenueToday = revenueResult._sum.priceUsd ?? 0;

    // newClientsThisWeek: Users created in last 7 days with role USER
    // Note: the schema uses UserRole enum (owner/manager/staff); new customers
    // are tracked by clientId (string) on appointments, not User rows in this schema.
    // Counting appointments with clientIds that first appeared in last 7 days.
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAppointments = await prisma.appointment.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { clientId: true },
    });
    const newClientsThisWeek = new Set(weekAppointments.map((a) => a.clientId)).size;

    // upcomingAppointments: scheduled/checked_in in the future
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        startAt: { gt: now },
        status: { in: ["scheduled", "checked_in"] },
      },
    });

    return {
      appointmentsToday,
      revenueToday,
      newClientsThisWeek,
      upcomingAppointments,
    };
  }),
});
