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
          { id: "a1", timestamp: Date.now(), source: "orchestrator", type: "thinking", message: "Processing your message..." },
        ]);

        await delay(400);
        setActivity((prev) => [
          ...prev,
          { id: "a2", timestamp: Date.now(), source: "orchestrator", type: "tool_call", message: "Setting trip requirements" },
        ]);

        await delay(300);
        setTripPlan(cachedTripPlan);

        setActivity((prev) => [
          ...prev,
          { id: "a3", timestamp: Date.now(), source: "orchestrator", type: "tool_result", message: "Decision tree updated" },
        ]);

        await delay(200);

        // Show first node view (flights)
        setLiveView(cachedNodeViews["flight-out"]);

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

      // ── Node selection: instant from cache ──
      if (action.type === "select_node" && action.nodeId) {
        const view = cachedNodeViews[action.nodeId];
        if (view) {
          setLiveView(view);
        } else {
          console.log("[cached] no view for node:", action.nodeId);
        }
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
