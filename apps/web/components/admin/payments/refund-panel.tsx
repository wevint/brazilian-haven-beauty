"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

interface RefundPanelProps {
  appointmentId: string;
  onRefundComplete?: () => void;
}

/**
 * Admin refund panel (US3 — T062).
 * Issues a refund for a given appointment via the payments.refund tRPC procedure.
 */
export function RefundPanel({ appointmentId, onRefundComplete }: RefundPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ refundId: string; status: string } | null>(null);

  const refundMutation = trpc.payments.refund.useMutation({
    onMutate: () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setSuccess(data);
      onRefundComplete?.();
    },
    onError: (err) => {
      setIsLoading(false);
      setError(err.message ?? "An error occurred while processing the refund.");
    },
  });

  const handleRefund = () => {
    refundMutation.mutate({ appointmentId });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
        Issue Refund
      </h2>

      {success ? (
        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Refund issued successfully
          </p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            Refund ID: {success.refundId}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Status: {success.status}
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleRefund}
            disabled={isLoading}
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {isLoading ? "Processing…" : "Issue Refund"}
          </button>
        </>
      )}
    </div>
  );
}
