import { describe, it, expect } from "vitest";
import { runTinyfishAgent } from "./agent-factory";

describe("tinyfish agent integration", () => {
  it("extracts data from a webpage via tinyfish", {
    timeout: 120_000,
  }, async () => {
    const result = await runTinyfishAgent(
      'Go to https://news.ycombinator.com and extract the top 3 story titles as JSON: [{"title": str}]'
    );

    console.log("Agent response:", result);

    // Agent should return a non-empty string with some content
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });
});
