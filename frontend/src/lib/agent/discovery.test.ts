import { describe, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createTinyfishAgent } from "./agent-factory";

const DISCOVERY_PROMPT = readFileSync(
  resolve(__dirname, "prompts/discovery.md"),
  "utf-8"
);

const discoveryAgent = createTinyfishAgent({ prompt: DISCOVERY_PROMPT });

describe("discovery skill", () => {
  it(
    "discovers and evaluates locations in Bali for surfing",
    { timeout: 120_000 },
    async () => {
      const result = await discoveryAgent(
        "I'm planning a trip to Bali, March 15-19. I love surfing and local food. " +
          "Find me the best spots and tell me what's actually worth visiting based on real reviews."
      );

      console.log("Discovery result:", result);
    }
  );
});
