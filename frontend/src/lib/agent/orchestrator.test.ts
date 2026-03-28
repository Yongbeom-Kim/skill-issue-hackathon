import { describe, it, expect } from "vitest";
import { createTripPlannerOrchestrator } from "./orchestrator";

describe("trip planner orchestrator", () => {
  it("exports a function that returns an async runner", () => {
    const runner = createTripPlannerOrchestrator();
    expect(typeof runner).toBe("function");
  });
});
