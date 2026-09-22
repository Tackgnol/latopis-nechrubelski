import { clearStored, readStored, useStored, writeStored } from "~/lib/stored";

export type Consent = "granted" | "denied" | null;
export type AnalyticsEvent = "book_roll" | "final_psalm_reached" | "campaign_reset_opened" | "campaign_reset";
export type EventProperties = Record<string, string | number>;

export interface Tracker {
  page(): void;
  track(event: AnalyticsEvent, properties?: EventProperties): void;
  stop(): void;
}

const MEASUREMENT_ID: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID || undefined;
const CONSENT_KEY = "analytics-consent";

/** True when the build carries a GA measurement ID; without one there is no analytics and no banner. */
export const analyticsEnabled = Boolean(MEASUREMENT_ID);

export function parseConsent(raw: string | null): Consent {
  return raw === "granted" || raw === "denied" ? raw : null;
}

/** Names of the Google Analytics cookies (`_ga`, `_ga_<id>`) in a `document.cookie` string. */
export function gaCookieNames(cookies: string): string[] {
  return cookies
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
}

/**
 * Forwards page views and events only while `isGranted()`; the real tracker is loaded on the first
 * granted call, so nothing is fetched from Google before consent.
 */
export function createTracker(load: () => Promise<Tracker | null>, isGranted: () => boolean): Tracker {
  let loaded: Promise<Tracker | null | undefined> | null = null;
  let consentVersion = 0;
  const whenGranted = (send: (tracker: Tracker) => void) => {
    if (!isGranted()) return;
    const version = consentVersion;
    loaded ??= load()
      .then((tracker) => {
        if (!tracker) loaded = null;
        return tracker;
      })
      .catch(() => {
        loaded = null;
        return undefined;
      });
    void loaded.then((tracker) => {
      if (version !== consentVersion || !isGranted()) return;
      if (tracker) send(tracker);
      else if (tracker === null) whenGranted(send);
    });
  };

  return {
    page: () => whenGranted((t) => t.page()),
    track: (event, properties) => whenGranted((t) => t.track(event, properties)),
    stop: () => {
      consentVersion++;
      void loaded?.then((t) => t?.stop());
    },
  };
}

async function loadGoogleAnalytics(measurementId: string): Promise<Tracker | null> {
  const [{ default: Analytics }, { default: googleAnalytics }] = await Promise.all([
    import("analytics"),
    import("@analytics/google-analytics"),
  ]);
  if (readStored(CONSENT_KEY, parseConsent) !== "granted") return null;
  const analytics = Analytics({
    app: "latopis-nechrubelski",
    plugins: [
      googleAnalytics({
        measurementIds: [measurementId],
        gtagConfig: {
          // Visitors consent to counting readers, not to Google's ad features.
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          // Host-only cookies, so they are not shared with other rpgtools.co apps and can be deleted from here.
          cookie_domain: "none",
        },
      }),
    ],
  });
  return {
    page: () => void analytics.page(),
    track: (event, properties) => void analytics.track(event, properties),
    stop: () => void analytics.reset(),
  };
}

const tracker = createTracker(
  () => loadGoogleAnalytics(MEASUREMENT_ID as string),
  () => analyticsEnabled && readStored(CONSENT_KEY, parseConsent) === "granted",
);

/** GA's documented opt-out flag; gtag checks it before every hit. */
function setOptOut(optedOut: boolean) {
  if (MEASUREMENT_ID) (window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = optedOut;
}

function withdraw() {
  setOptOut(true);
  tracker.stop();
  for (const name of gaCookieNames(document.cookie)) document.cookie = `${name}=; Max-Age=0; path=/`;
}

export const trackPage = tracker.page;
export const track = tracker.track;

/** The visitor's choice; "pending" on the server and during hydration, so prerendered pages carry no banner. */
export function useConsent(): Consent | "pending" {
  return useStored<Consent | "pending">(CONSENT_KEY, parseConsent, "pending");
}

/** Records consent and counts the page it was given on. */
export function grantConsent() {
  writeStored(CONSENT_KEY, "granted");
  setOptOut(false);
  trackPage();
}

export function denyConsent() {
  writeStored(CONSENT_KEY, "denied");
  withdraw();
}

/** Forgets the choice (the banner asks again) and stops analytics until it is given anew. */
export function resetConsent() {
  clearStored(CONSENT_KEY);
  withdraw();
}
