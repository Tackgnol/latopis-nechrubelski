// @analytics/google-analytics ships no type declarations.
declare module "@analytics/google-analytics" {
  import type { AnalyticsPlugin } from "analytics";

  export default function googleAnalytics(config: {
    measurementIds: string[];
    gtagConfig?: Record<string, unknown>;
  }): AnalyticsPlugin;
}
