import { describe, it, expect } from "vitest";
import { createTripPlannerOrchestrator } from "./orchestrator";

describe("trip planner orchestrator", () => {
  it("exports a function that returns an async runner", () => {
    const runner = createTripPlannerOrchestrator();
    expect(typeof runner).toBe("function");
  });
});

describe("trip planner orchestrator integration", () => {
  it(
    "generates a trip plan from a user request",
    { timeout: 300_000 },
    async () => {
      const runner = createTripPlannerOrchestrator();
      const result = await runner(
        "Plan a 2-day trip to Tokyo in April. Budget $500. I love ramen and temples. Flying from San Francisco."
      );

      console.log("Orchestrator response:", result);

      // Orchestrator should return a non-empty response
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(50);
    }
  );
});
