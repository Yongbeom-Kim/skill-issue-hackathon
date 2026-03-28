import { createTinyfishAgent } from "./agent-factory";
import { RESEARCH_PROMPT } from "./prompts/research-agent";

/**
 * Creates a research agent runner.
 * The research agent finds and evaluates real places, booking options,
 * and logistics data using web search and TinyFish web automation.
 *
 * It knows which data sources to use for each category:
 * - Flights: Google Flights, Skyscanner, Kiwi, Kayak
 * - Hotels: Booking.com, Agoda, Airbnb, Hostelworld
 * - Activities: GetYourGuide, Viator, Klook
 * - Transport: Rome2Rio, Trainline, 12Go.Asia
 * - Reviews: TripAdvisor, Reddit, Google Maps
 * - Local sources: Tabelog (JP), Naver (KR), Xiaohongshu (CN)
 *
 * Returns a function: (query: string) => Promise<string>
 */
export function createResearchAgent() {
  return createTinyfishAgent({ prompt: RESEARCH_PROMPT });
}
