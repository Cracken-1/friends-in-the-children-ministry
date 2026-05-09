import { describe, expect, it } from "vitest";

import { normalizeKenyanPhone } from "@/server/security/phone";

describe("normalizeKenyanPhone", () => {
  it("keeps valid 254 mobile numbers", () => {
    expect(normalizeKenyanPhone("254712345678")).toBe("254712345678");
  });

  it("converts local 07 numbers", () => {
    expect(normalizeKenyanPhone("0712 345 678")).toBe("254712345678");
  });

  it("rejects invalid numbers", () => {
    expect(() => normalizeKenyanPhone("123")).toThrow("valid Kenyan mobile");
  });
});
