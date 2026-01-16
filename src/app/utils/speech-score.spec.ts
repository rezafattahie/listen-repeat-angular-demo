import { describe, it, expect } from "vitest";
import { normalize, tokenF1 } from "./speech-score";

describe("speech-score", () => {
    it("normalize removes punctuation and extra spaces", () => {
        expect(normalize("  Hello,   World!!! ")).toBe("hello world");
    });

    it("tokenF1 returns 1 for identical sentences", () => {
        expect(tokenF1("Hallo Welt", "Hallo Welt")).toBe(1);
    });

    it("tokenF1 returns 0 for completely different sentences", () => {
        expect(tokenF1("Hallo", "Banane")).toBe(0);
    });

    it("tokenF1 returns a value between 0 and 1 for partial match", () => {
        const v = tokenF1("ich gehe nach hause", "ich gehe");
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThan(1);
    });
});
