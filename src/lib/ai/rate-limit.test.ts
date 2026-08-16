import { describe, expect, test } from "bun:test";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  test("mengizinkan permintaan di bawah batas", () => {
    const limiter = createRateLimiter(2, 60_000);
    expect(limiter.allow("user-a")).toBe(true);
    expect(limiter.allow("user-a")).toBe(true);
  });

  test("menolak permintaan melebihi batas", () => {
    const limiter = createRateLimiter(2, 60_000);
    limiter.allow("user-a");
    limiter.allow("user-a");
    expect(limiter.allow("user-a")).toBe(false);
  });

  test("limiter per key terpisah", () => {
    const limiter = createRateLimiter(1, 60_000);
    limiter.allow("user-a");
    expect(limiter.allow("user-b")).toBe(true);
    expect(limiter.allow("user-a")).toBe(false);
  });

  test("reset setelah window berlalu", () => {
    let currentTime = 0;
    const limiter = createRateLimiter(1, 50, () => currentTime);
    expect(limiter.allow("user-a")).toBe(true);
    expect(limiter.allow("user-a")).toBe(false);

    currentTime += 51;
    expect(limiter.allow("user-a")).toBe(true);
  });
});
