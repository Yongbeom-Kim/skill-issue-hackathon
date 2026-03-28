import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createTinyfishAgent } from "./agent-factory";
import { LOGISTICS_PROMPT } from "./prompts/logistics-agent";
import { ORCHESTRATOR_PROMPT } from "./prompts/orchestrator-agent";
import { RESEARCH_PROMPT } from "./prompts/research-agent";
import type { OrchestratorCallbacks } from "../../types";

// ── Zod schemas mirroring the TypeScript types ────────────

const userPreferencesSchema = z.object({
  canDrive: z.boolean(),
  hotelClass: z.enum(["budget", "mid", "luxury"]),
  travelStyle: z.enum(["relaxed", "balanced", "packed"]),
});

const userRequirementsSchema = z.object({
  destination: z.string(),
  when: z.string(),
  budget: z.number(),
  budgetRemaining: z.number(),
  preferences: userPreferencesSchema,
});

const communityQuoteSchema = z.object({
  source: z.string(),
  text: z.string(),
  originalText: z.string().optional(),
  score: z.number().optional(),
});

const flightOptionSchema = z.object({
  id: z.string(),
  airline: z.string(),
  flightNumber: z.string(),
  price: z.number(),
  currency: z.string(),
  departure: z.string(),
  arrival: z.string(),
  duration: z.string(),
  stops: z.number(),
  stopCity: z.string().optional(),
  route: z.string(),
  date: z.string(),
  source: z.string(),
  sourceUrl: z.string(),
  badge: z.string().optional(),
});

const hotelOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
  location: z.string(),
  pricePerNight: z.number(),
  totalPrice: z.number(),
  currency: z.string(),
  rating: z.number(),
  nights: z.number(),
  checkIn: z.string(),
  checkOut: z.string(),
  source: z.string(),
  sourceUrl: z.string(),
  available: z.boolean(),
  badge: z.string().optional(),
});

const discoveryItemSchema = z.object({
  id: z.string(),
  place: z.string(),
  imageUrl: z.string().optional(),
  sentiment: z.number(),
  postCount: z.number(),
  summary: z.string(),
  category: z.string(),
  priceLevel: z.string().optional(),
  duration: z.string().optional(),
  quotes: z.array(communityQuoteSchema),
  tags: z.array(z.string()),
});

const decisionSchema = z.union([flightOptionSchema, hotelOptionSchema, discoveryItemSchema]);

const tripNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(["destination", "flight", "hotel", "activity", "transport"]),
    label: z.string(),
    status: z.enum(["pending", "active", "decided"]),
    decision: decisionSchema.nullable().optional(),
    cost: z.number().optional(),
    children: z.array(tripNodeSchema).optional(),
  })
);

const updateDecisionTreeSchema = z.object({
  requirements: userRequirementsSchema.optional().describe("Set/update user requirements"),
  nodes: z.array(tripNodeSchema).optional().describe("Replace entire node tree (initial scaffold)"),
  updateNode: z
    .object({
      nodeId: z.string(),
      status: z.enum(["pending", "active", "decided"]).optional(),
      label: z.string().optional(),
      decision: decisionSchema.nullable().optional(),
      cost: z.number().optional(),
    })
    .optional()
    .describe("Update a single node by ID"),
});

const agentStatusSchema = z.object({
  id: z.string(),
  name: z.string().describe("Display name, e.g. 'Singapore Airlines'"),
  site: z.string().describe("Website being scraped, e.g. 'singaporeair.com'"),
  status: z.enum(["queued", "running", "done", "failed"]),
  message: z.string().describe("Progress message, e.g. 'Navigating booking engine...'"),
  resultCount: z.number().optional(),
});

const updateRealtimeViewSchema = z.object({
  nodeId: z.string().describe("Which TripNode.id this view is for"),
  phase: z.enum(["empty", "loading", "flights", "hotels", "discovery", "decided"]),
  title: z.string().describe("Panel header title, e.g. 'Flights SIN → SYD'"),
  subtitle: z.string().optional(),
  agents: z.array(agentStatusSchema).optional().describe("Agent progress rows (loading phase)"),
  flights: z.array(flightOptionSchema).optional().describe("Flight cards (flights phase)"),
  hotels: z.array(hotelOptionSchema).optional().describe("Hotel cards (hotels phase)"),
  discoveries: z.array(discoveryItemSchema).optional().describe("Discovery cards (discovery phase)"),
  decidedItem: decisionSchema.optional().describe("The locked-in item (decided phase)"),
});

// ── Orchestrator factory ──────────────────────────────────

export function createTripPlannerOrchestrator(callbacks: OrchestratorCallbacks) {
  const researchRunner = createTinyfishAgent({ prompt: RESEARCH_PROMPT });
  const logisticsRunner = createTinyfishAgent({ prompt: LOGISTICS_PROMPT });

  const callResearchAgent = new DynamicStructuredTool({
    name: "call_research_agent",
    description:
      "Dispatch a query to the travel research agent. " +
      "The research agent searches travel websites, booking platforms, review sites, and local-language sources " +
      "(Tabelog, Naver, Xiaohongshu) to gather destination info, dining recommendations, booking options, " +
      "pricing data, tips, crowd data, and hidden gems. " +
      "It knows the best data source for each category (flights, hotels, activities, transport, reviews). " +
      "Send specific, targeted queries for best results.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The research query to send to the agent. Be specific — e.g. " +
            "'Find top-rated ramen shops in Shinjuku with crowd-avoidance tips from Reddit and Tabelog' or " +
            "'Compare flight prices SFO to NRT in April from Google Flights and Skyscanner'"
        ),
    }),
    func: async ({ query }) => {
      return await researchRunner(query);
    },
  });

  const callLogisticsAgent = new DynamicStructuredTool({
    name: "call_logistics_agent",
    description:
      "Dispatch a query to the travel logistics agent. " +
      "The logistics agent scrapes travel sites (Google Flights, Booking.com, Rome2Rio, etc.) " +
      "to find flights, hotels, transport options, weather, and practical travel info. " +
      "Send specific, targeted queries for best results.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The logistics query to send to the agent. Be specific — e.g. " +
            "'Find round-trip flights SFO to NRT, April 10-15, budget under $800'"
        ),
    }),
    func: async ({ query }) => {
      return await logisticsRunner(query);
    },
  });

  const updateDecisionTree = new DynamicStructuredTool({
    name: "update_decision_tree",
    description:
      "Update the trip decision tree shown in the left panel. Use this to: " +
      "(1) set user requirements after extracting them from the conversation, " +
      "(2) scaffold the initial node tree, " +
      "(3) update a single node's status, label, decision, or cost. " +
      "Call this whenever the trip plan structure changes.",
    schema: updateDecisionTreeSchema,
    func: async (input) => {
      callbacks.onUpdateDecisionTree(input);
      return "Decision tree updated";
    },
  });

  const updateRealtimeView = new DynamicStructuredTool({
    name: "update_realtime_view",
    description:
      "Update the realtime view shown in the right panel. Use this to: " +
      "(1) show loading state with agent progress rows when starting research, " +
      "(2) show flight/hotel/discovery results when agents finish, " +
      "(3) show the decided item when the user makes a choice. " +
      "Call this before dispatching agents (loading phase) and after collecting results.",
    schema: updateRealtimeViewSchema,
    func: async (input) => {
      callbacks.onUpdateRealtimeView(input);
      return "Realtime view updated";
    },
  });

  return createTinyfishAgent({
    prompt: ORCHESTRATOR_PROMPT,
    tools: [callResearchAgent, callLogisticsAgent, updateDecisionTree, updateRealtimeView],
  });
}
