/**
 * Distributed slot lock via Upstash Redis (NX + PX).
 * Prevents double-booking under concurrent load.
 */

import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function lockKey(staffId: string, startAt: Date): string {
  return `slot:${staffId}:${startAt.toISOString()}`;
}

/**
 * Attempt to acquire an exclusive lock on a booking slot.
 *
 * @param staffId  Staff UUID
 * @param startAt  Slot start time
 * @param ttlMs    Lock TTL in milliseconds (default 10 000 ms)
 * @returns        A unique lock token string if acquired, or null if already locked.
 */
export async function acquireSlotLock(
  staffId: string,
  startAt: Date,
  ttlMs = 10_000
): Promise<string | null> {
  const token = randomBytes(16).toString("hex");
  const key = lockKey(staffId, startAt);

  // SET key token NX PX ttlMs  – returns "OK" on success, null if already set
  const result = await redis.set(key, token, { nx: true, px: ttlMs });

  if (result === "OK" || result === 1) {
    return token;
  }

  return null;
}

/**
 * Release a previously acquired slot lock.
 * Uses a Lua script to ensure we only delete if the token matches (avoids
 * accidentally releasing a lock held by a different request).
 *
 * @param staffId    Staff UUID
 * @param startAt    Slot start time
 * @param lockToken  Token returned by acquireSlotLock
 */
export async function releaseSlotLock(
  staffId: string,
  startAt: Date,
  lockToken: string
): Promise<void> {
  const key = lockKey(staffId, startAt);

  // Atomic check-and-delete via Lua script
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  await redis.eval(script, [key], [lockToken]);
}
