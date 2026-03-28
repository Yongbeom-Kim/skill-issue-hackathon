import { describe, it } from "vitest";

const TINYFISH_API_KEY = import.meta.env.VITE_TINYFISH_API_KEY;
const TINYFISH_BASE_URL = "https://agent.tinyfish.ai/v1";

describe("raw tinyfish call", () => {
  it(
    "async endpoint — fire and poll",
    { timeout: 120_000 },
    async () => {
      console.log("API key present:", !!TINYFISH_API_KEY);

      // Step 1: Start async run
      console.log("Starting async run...");
      const startRes = await fetch(
        `${TINYFISH_BASE_URL}/automation/run-async`,
        {
          method: "POST",
          headers: {
            "X-API-Key": TINYFISH_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://example.com",
            goal: "Extract the page title and the first paragraph of text.",
          }),
        }
      );

      console.log("Start status:", startRes.status);
      const startBody = await startRes.json();
      console.log("Start response:", JSON.stringify(startBody, null, 2));

      if (!startBody.run_id) {
        console.log("No run_id returned, stopping.");
        return;
      }

      // Step 2: Poll for result
      const runId = startBody.run_id;
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 10_000));
        console.log(`Polling attempt ${i + 1}...`);

        const pollRes = await fetch(`${TINYFISH_BASE_URL}/runs/${runId}`, {
          headers: { "X-API-Key": TINYFISH_API_KEY },
        });

        console.log("Poll status:", pollRes.status);
        const pollBody = await pollRes.json();
        console.log("Poll response:", JSON.stringify(pollBody, null, 2));

        if (pollBody.status === "COMPLETED" || pollBody.status === "FAILED") {
          break;
        }
      }
    }
  );
});
