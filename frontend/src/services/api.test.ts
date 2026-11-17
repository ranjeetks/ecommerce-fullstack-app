import { afterEach, describe, expect, it } from "vitest";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./api";

describe("token helpers", () => {
  afterEach(() => localStorage.clear());

  it("saves and reads both tokens", () => {
    saveTokens("access-123", "refresh-456");
    expect(getAccessToken()).toBe("access-123");
    expect(getRefreshToken()).toBe("refresh-456");
  });

  it("returns null when nothing is stored", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("clearTokens removes tokens and the cached user", () => {
    saveTokens("a", "r");
    localStorage.setItem("user", "{}");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
