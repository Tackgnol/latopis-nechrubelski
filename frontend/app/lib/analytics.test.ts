import { describe, expect, it } from "vitest";
import { createTracker, gaCookieNames, parseConsent, type Tracker } from "./analytics";

function setup(initiallyGranted: boolean) {
  let granted = initiallyGranted;
  const calls: string[] = [];
  let loads = 0;
  const fake: Tracker = {
    page: () => calls.push("page"),
    track: (event, properties) => calls.push(`${event}${properties ? JSON.stringify(properties) : ""}`),
    stop: () => calls.push("stop"),
  };
  const tracker = createTracker(
    async () => {
      loads++;
      return fake;
    },
    () => granted,
  );
  const settle = () => new Promise((resolve) => setTimeout(resolve));
  return { tracker, calls, loads: () => loads, grant: () => (granted = true), deny: () => (granted = false), settle };
}

describe("createTracker", () => {
  it("loads nothing and sends nothing without consent", async () => {
    const s = setup(false);
    s.tracker.page();
    s.tracker.track("campaign_reset");
    s.tracker.stop();
    await s.settle();
    expect(s.loads()).toBe(0);
    expect(s.calls).toEqual([]);
  });

  it("loads once and forwards page views and events once consent is granted", async () => {
    const s = setup(false);
    s.tracker.page();
    s.grant();
    s.tracker.page();
    s.tracker.track("book_roll", { from: "closed", psalm: 3 });
    await s.settle();
    expect(s.loads()).toBe(1);
    expect(s.calls).toEqual(["page", 'book_roll{"from":"closed","psalm":3}']);
  });

  it("stops the loaded tracker and sends nothing after consent is withdrawn", async () => {
    const s = setup(true);
    s.tracker.page();
    s.deny();
    s.tracker.stop();
    s.tracker.track("final_psalm_reached");
    await s.settle();
    expect(s.calls).toEqual(["stop"]);
  });
  it("can retry after the analytics bundle fails to load", async () => {
    const calls: string[] = [];
    let attempts = 0;
    const tracker = createTracker(
      async () => {
        if (++attempts === 1) throw new Error("network error");
        return { page: () => calls.push("page"), track: () => {}, stop: () => {} };
      },
      () => true,
    );

    tracker.page();
    await new Promise((resolve) => setTimeout(resolve));
    tracker.page();
    await new Promise((resolve) => setTimeout(resolve));

    expect(attempts).toBe(2);
    expect(calls).toEqual(["page"]);
  });
  it("loads again when consent returns before a cancelled load settles", async () => {
    let finishLoad!: (tracker: Tracker | null) => void;
    let granted = true;
    let loads = 0;
    const calls: string[] = [];
    const tracker = createTracker(
      () => ++loads === 1
        ? new Promise<Tracker | null>((resolve) => { finishLoad = resolve; })
        : Promise.resolve({ page: () => calls.push("page"), track: () => {}, stop: () => {} }),
      () => granted,
    );

    tracker.page();
    granted = false;
    tracker.stop();
    granted = true;
    tracker.page();
    finishLoad(null);
    await new Promise((resolve) => setTimeout(resolve));

    expect(loads).toBe(2);
    expect(calls).toEqual(["page"]);
  });
  it("drops a queued page view when consent is withdrawn during loading", async () => {
    let finishLoad!: (tracker: Tracker) => void;
    let granted = true;
    const calls: string[] = [];
    const tracker = createTracker(
      () => new Promise<Tracker>((resolve) => { finishLoad = resolve; }),
      () => granted,
    );

    tracker.page();
    granted = false;
    tracker.stop();
    finishLoad({ page: () => calls.push("page"), track: () => {}, stop: () => calls.push("stop") });
    await new Promise((resolve) => setTimeout(resolve));

    expect(calls).toEqual(["stop"]);
  });
});

describe("parseConsent", () => {
  it("keeps a stored choice and treats anything else as not chosen", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("yes")).toBeNull();
  });
});

describe("gaCookieNames", () => {
  it("picks only Google Analytics cookies", () => {
    expect(gaCookieNames("_ga=GA1.1.1; csrf=x; _ga_WC4LVD7H0G=GS1; _gads=other; theme=dark")).toEqual(["_ga", "_ga_WC4LVD7H0G"]);
    expect(gaCookieNames("")).toEqual([]);
  });
});
