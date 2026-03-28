/**
 * Drop-in replacement for useOrchestrator that replays cached data.
 * Activate with VITE_USE_CACHE=true
 */
import { useState, useCallback } from "react";
import { useSetAtom } from "jotai";
import { tripPlanAtom } from "../atoms/tripPlan";
import { liveViewAtom } from "../atoms/liveView";
import { chatMessagesAtom } from "../atoms/chat";
import { agentActivityAtom } from "../atoms/agentActivity";
import {
  cachedTripPlan,
  cachedNodeViews,
  cachedChatMessages,
} from "../lib/cached-scenario";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useCachedOrchestrator() {
  const [isRunning, setIsRunning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const setTripPlan = useSetAtom(tripPlanAtom);
  const setLiveView = useSetAtom(liveViewAtom);
  const setChatMessages = useSetAtom(chatMessagesAtom);
  const setActivity = useSetAtom(agentActivityAtom);

  const run = useCallback(
    async (action: { type: string; message?: string; nodeId?: string; optionId?: string }) => {
      // ── First chat message: scaffold trip plan ──
      if (action.type === "chat" && !initialized) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "user" as const,
            content: action.message ?? "",
            timestamp: Date.now(),
          },
        ]);

        setIsRunning(true);
        setActivity([
          { id: "a1", timestamp: Date.now(), source: "orchestrator", type: "thinking", message: "Understanding your trip requirements..." },
        ]);

        await delay(1500);
        setActivity((prev) => [
          ...prev,
          { id: "a2", timestamp: Date.now(), source: "orchestrator", type: "tool_call", message: "Researching destinations and routing..." },
        ]);

        await delay(2000);
        setActivity((prev) => [
          ...prev,
          { id: "a3", timestamp: Date.now(), source: "research", type: "thinking", message: "Searching XHS and Reddit for community tips..." },
        ]);

        await delay(2500);
        setActivity((prev) => [
          ...prev,
          { id: "a4", timestamp: Date.now(), source: "orchestrator", type: "tool_call", message: "Building your trip plan..." },
        ]);

        await delay(1000);
        setTripPlan(cachedTripPlan);

        setActivity((prev) => [
          ...prev,
          { id: "a5", timestamp: Date.now(), source: "orchestrator", type: "tool_result", message: "Decision tree updated" },
        ]);

        await delay(1500);
        setActivity((prev) => [
          ...prev,
          { id: "a6", timestamp: Date.now(), source: "logistics", type: "thinking", message: "Scraping live flight prices from airline sites..." },
        ]);

        await delay(2000);

        // Show first node view (flights)
        setLiveView(cachedNodeViews["flight-out"]);

        setActivity((prev) => [
          ...prev,
          { id: "a7", timestamp: Date.now(), source: "orchestrator", type: "tool_result", message: "Found flights — presenting options" },
        ]);

        await delay(500);

        // Add chat response
        setChatMessages((prev) => [...prev, ...cachedChatMessages]);

        setInitialized(true);
        setIsRunning(false);
        return;
      }

      // ── Subsequent chat messages ──
      if (action.type === "chat") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "user" as const,
            content: action.message ?? "",
            timestamp: Date.now(),
          },
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: "I've already loaded the cached trip data. Click on any node in the left panel to explore flights, hotels, and activities!",
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      // ── Node selection: simulate scraping then show results ──
      if (action.type === "select_node" && action.nodeId) {
        const view = cachedNodeViews[action.nodeId];
        if (!view) {
          console.log("[cached] no view for node:", action.nodeId);
          return;
        }

        setIsRunning(true);

        // Determine what kind of agents to show
        const isFlight = view.phase === "flights"
        const isHotel = view.phase === "hotels"
        const agents = isFlight
          ? [
              { id: "s1", name: "Scoot", site: "flyscoot.com", status: "running" as const, message: "Searching flights..." },
              { id: "s2", name: "Jetstar", site: "jetstar.com", status: "queued" as const, message: "Waiting..." },
              { id: "s3", name: "Singapore Airlines", site: "singaporeair.com", status: "queued" as const, message: "Waiting..." },
              { id: "s4", name: "AirAsia", site: "airasia.com", status: "queued" as const, message: "Waiting..." },
            ]
          : isHotel
            ? [
                { id: "s1", name: "Booking.com", site: "booking.com", status: "running" as const, message: "Searching hotels..." },
                { id: "s2", name: "Agoda", site: "agoda.com", status: "queued" as const, message: "Waiting..." },
                { id: "s3", name: "Expedia", site: "expedia.com", status: "queued" as const, message: "Waiting..." },
              ]
            : [
                { id: "s1", name: "Xiaohongshu", site: "xiaohongshu.com", status: "running" as const, message: "Searching posts..." },
                { id: "s2", name: "Reddit", site: "reddit.com", status: "queued" as const, message: "Waiting..." },
                { id: "s3", name: "TripAdvisor", site: "tripadvisor.com", status: "queued" as const, message: "Waiting..." },
              ]

        // Show loading state
        setLiveView({
          nodeId: action.nodeId,
          phase: "loading",
          agents,
          flights: [], hotels: [], discoveries: [],
          decidedItem: null,
          title: view.title,
          subtitle: "Searching...",
        })

        // Simulate agents completing one by one
        await delay(1200)
        setLiveView((prev) => ({
          ...prev,
          agents: prev.agents.map((a, i) =>
            i === 0 ? { ...a, status: "done" as const, message: `Found results`, resultCount: 2 }
            : i === 1 ? { ...a, status: "running" as const, message: "Navigating booking engine..." }
            : a
          ),
        }))

        await delay(1500)
        setLiveView((prev) => ({
          ...prev,
          agents: prev.agents.map((a, i) =>
            i === 1 ? { ...a, status: "done" as const, message: `Found results`, resultCount: 3 }
            : i === 2 ? { ...a, status: "running" as const, message: "Extracting prices..." }
            : a
          ),
        }))

        await delay(1800)
        setLiveView((prev) => ({
          ...prev,
          agents: prev.agents.map((a, i) =>
            i >= 2 ? { ...a, status: "done" as const, message: `Found results`, resultCount: i === 2 ? 2 : 1 }
            : a
          ),
        }))

        await delay(800)

        // Show actual results
        setLiveView(view)
        setIsRunning(false)
        return;
      }

      // ── Decide: mark node as decided ──
      if (action.type === "decide" && action.nodeId && action.optionId) {
        const view = cachedNodeViews[action.nodeId];
        if (!view) return;

        // Find the selected item
        const item =
          view.flights.find((f) => f.id === action.optionId) ??
          view.hotels.find((h) => h.id === action.optionId) ??
          view.discoveries.find((d) => d.id === action.optionId);

        if (item) {
          const cost = "price" in item ? item.price : "totalPrice" in item ? item.totalPrice : 0;
          const name = itemDisplayName(item);
          const priceStr = "price" in item
            ? `$${item.price} ${item.currency}`
            : "totalPrice" in item
              ? `$${(item as { totalPrice: number; currency: string }).totalPrice} ${(item as { currency: string }).currency}`
              : "";

          // Chat confirmation
          setChatMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: generateDecisionMessage(name, priceStr, view.title, cost, action.nodeId!),
              timestamp: Date.now(),
            },
          ]);

          // Update left panel node
          setTripPlan((prev) => {
            const updateNodes = (nodes: typeof prev.nodes): typeof prev.nodes =>
              nodes.map((n) => {
                if (n.id === action.nodeId) {
                  return { ...n, status: "decided" as const, decision: item, cost };
                }
                if (n.children) {
                  return { ...n, children: updateNodes(n.children) };
                }
                return n;
              });
            const newNodes = updateNodes(prev.nodes);
            const totalSpent = calcSpent(newNodes);
            return {
              ...prev,
              nodes: newNodes,
              requirements: prev.requirements
                ? { ...prev.requirements, budgetRemaining: prev.requirements.budget - totalSpent }
                : null,
            };
          });

          // Update right panel to "decided"
          setLiveView({
            ...view,
            phase: "decided",
            decidedItem: item,
            title: view.title,
            subtitle: "Decided",
          });

          // Update cached view too
          cachedNodeViews[action.nodeId] = {
            ...view,
            phase: "decided",
            decidedItem: item,
            subtitle: "Decided",
          };
        }
        return;
      }
    },
    [initialized, setTripPlan, setLiveView, setChatMessages, setActivity]
  );

  return { run, isRunning };
}

function calcSpent(nodes: Array<{ cost?: number; children?: Array<{ cost?: number; children?: unknown[] }> }>): number {
  let total = 0;
  for (const n of nodes) {
    if (n.cost) total += n.cost;
    if (n.children) total += calcSpent(n.children as typeof nodes);
  }
  return total;
}

function itemDisplayName(item: Record<string, unknown>): string {
  if ("airline" in item) return `${item.airline} ${item.flightNumber}`;
  if ("name" in item) return item.name as string;
  if ("place" in item) return item.place as string;
  return "this option";
}

function generateDecisionMessage(
  name: string,
  priceStr: string,
  category: string,
  _cost: number,
  nodeId: string,
): string {
  const isFlight = nodeId.includes("flight");
  const isHotel = nodeId === "hotel";

  if (isFlight) {
    return `<p>Locked in <strong>${name}</strong> for ${priceStr}. ${
      nodeId.includes("ret") ? "Return flight sorted!" : "Outbound flight sorted!"
    } Click another item in the plan to keep going.</p>`;
  }

  if (isHotel) {
    return `<p>Great choice — <strong>${name}</strong> at ${priceStr} total. Your accommodation is set! Now let's look at what to do each day.</p>`;
  }

  // Activity / discovery
  return `<p>Added <strong>${name}</strong> to your plan for <em>${category}</em>. Tap the next day to keep building your itinerary.</p>`;
}
