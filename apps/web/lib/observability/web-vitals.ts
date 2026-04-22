/**
 * Web Vitals reporting hook for Next.js.
 *
 * Export this function from `app/layout.tsx` or a dedicated
 * `app/web-vitals.ts` to collect Core Web Vitals metrics.
 *
 * Full implementation with GTM integration is added in T123 (Polish phase).
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export type WebVitalsMetric = {
  id: string;
  name: "CLS" | "FID" | "FCP" | "LCP" | "TTFB" | "INP";
  value: number;
  delta: number;
  rating: "good" | "needs-improvement" | "poor";
};

/**
 * Report a Web Vitals metric.
 * Called automatically by Next.js for each Core Web Vitals measurement.
 *
 * In production this should forward metrics to an analytics endpoint
 * (e.g., Google Analytics, Datadog RUM, or a custom /api/vitals route).
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Web Vitals]", metric.name, metric.value, metric.rating);
    return;
  }

  // TODO (T123): Forward metrics to GTM dataLayer / analytics endpoint
  // Example:
  // window.dataLayer?.push({
  //   event: "web_vitals",
  //   metric_name: metric.name,
  //   metric_value: metric.value,
  //   metric_rating: metric.rating,
  // });
}
