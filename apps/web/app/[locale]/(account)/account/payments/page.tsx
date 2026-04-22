import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { trpcServer } from "@/lib/trpc/server";

interface AccountPaymentsPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Account payment methods page (US3 — T061).
 * Displays saved payment methods for the authenticated user.
 */
export default async function AccountPaymentsPage({
  params,
}: AccountPaymentsPageProps) {
  const { locale } = await params;

  const session = await auth();
  if (!session) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const caller = await trpcServer();
  const savedMethods = await caller.payments.listSavedMethods();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Payment Methods
        </h1>
        <Link
          href={`/${locale}/account`}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          Back to Account
        </Link>
      </div>

      {savedMethods.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-500">No saved payment methods.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {savedMethods.map((method) => (
            <li
              key={method.id}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-14 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {method.brand}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    •••• •••• •••• {method.last4}
                  </p>
                  {method.isDefault && (
                    <span className="mt-0.5 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
