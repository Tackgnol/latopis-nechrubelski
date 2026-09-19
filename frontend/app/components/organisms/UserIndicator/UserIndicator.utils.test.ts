import { describe, expect, it } from "vitest";
import { nicknameToShow } from "./UserIndicator.utils";

describe("nicknameToShow", () => {
  it("returns the nickname of a signed-in user", () => {
    expect(nicknameToShow({ authenticated: true, user: { login: "grave_digger", isAnonymous: false } })).toBe(
      "grave_digger",
    );
  });

  it("returns null when signed out or anonymous", () => {
    expect(nicknameToShow({ authenticated: false, user: null })).toBeNull();
    expect(nicknameToShow({ authenticated: true, user: { login: "traveler", isAnonymous: true } })).toBeNull();
  });
});
