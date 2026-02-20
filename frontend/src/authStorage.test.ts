import { describe, it, expect, beforeEach } from "vitest";
import { setToken, getToken, clearToken, isLoggedIn, TOKEN_KEY } from "./authStorage";

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should store token after login", () => {
    setToken("jwt-123");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-123");
    expect(getToken()).toBe("jwt-123");
  });

  it("should clear token on logout", () => {
    setToken("jwt-123");
    clearToken();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("should detect isLoggedIn if token exists", () => {
    expect(isLoggedIn()).toBe(false);
    setToken("jwt-123");
    expect(isLoggedIn()).toBe(true);
  });
});
