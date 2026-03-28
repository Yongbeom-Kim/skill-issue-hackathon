import { useState, useCallback, useRef } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { tripPlanAtom, updateNodeInTree } from "../atoms/tripPlan";
import { liveViewAtom, nodeResultCacheAtom } from "../atoms/liveView";
import { chatMessagesAtom } from "../atoms/chat";
import { agentActivityAtom, type AgentActivityEvent } from "../atoms/agentActivity";
import { createTripPlannerOrchestrator } from "../lib/agent/orchestrator";
import type {
  UserAction,
  UpdateDecisionTreeInput,
  UpdateRealtimeViewInput,
  TripPlan,
  LiveView,
} from "../types";

function actionToMessage(action: UserAction): string {
  switch (action.type) {
    case "chat":
      return action.message;
    case "select_node":
      return `User selected node "${action.nodeId}". Research and present options for this node. Do NOT re-set requirements or re-scaffold the tree — only research this specific node and call update_realtime_view with results.`;
    case "decide":
      return `User decided on option "${action.optionId}" for node "${action.nodeId}". Lock in this choice and update the plan.`;
    case "revise":
      return `User wants different options for node "${action.nodeId}". Feedback: "${action.feedback}"`;
  }
}

function applyTreeUpdate(prev: TripPlan, input: UpdateDecisionTreeInput): TripPlan {
  let next = { ...prev };

  if (input.requirements) {
    next.requirements = input.requirements;
  }

  if (input.nodes) {
    next.nodes = input.nodes;
  }

  if (input.updateNode) {
    const { nodeId, ...updates } = input.updateNode;
    next.nodes = updateNodeInTree(next.nodes, nodeId, updates);
  }

  return next;
}

function applyViewUpdate(input: UpdateRealtimeViewInput): LiveView {
  return {
    nodeId: input.nodeId,
    phase: input.phase,
    title: input.title,
    subtitle: input.subtitle ?? "",
    agents: input.agents ?? [],
    flights: input.flights ?? [],
    hotels: input.hotels ?? [],
    discoveries: input.discoveries ?? [],
    decidedItem: input.decidedItem ?? null,
  };
}

export function useOrchestrator() {
  const [isRunning, setIsRunning] = useState(false);
  const setTripPlan = useSetAtom(tripPlanAtom);
  const setLiveView = useSetAtom(liveViewAtom);
  const setNodeCache = useSetAtom(nodeResultCacheAtom);
  const nodeCache = useAtomValue(nodeResultCacheAtom);
  const setChatMessages = useSetAtom(chatMessagesAtom);
  const setActivity = useSetAtom(agentActivityAtom);
  const orchestratorRef = useRef<ReturnType<typeof createTripPlannerOrchestrator> | null>(null);

  // Ref to always see latest cache without stale closures
  const nodeCacheRef = useRef(nodeCache);
  nodeCacheRef.current = nodeCache;

  const getOrchestrator = useCallback(() => {
    if (!orchestratorRef.current) {
      orchestratorRef.current = createTripPlannerOrchestrator({
        onUpdateDecisionTree: (input) => {
          console.log("[update_decision_tree]", input);
          setTripPlan((prev) => applyTreeUpdate(prev, input));
        },
        onUpdateRealtimeView: (input) => {
          console.log("[update_realtime_view]", input);
          const view = applyViewUpdate(input);
          setLiveView(view);
          // Cache non-transient results (not loading/empty)
          if (view.nodeId && view.phase !== "loading" && view.phase !== "empty") {
            setNodeCache((prev) => ({ ...prev, [view.nodeId]: view }));
          }
        },
        onActivity: (event) => {
          const entry: AgentActivityEvent = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...event,
          };
          console.log(`[${event.source}] ${event.type}: ${event.message}`);
          setActivity((prev) => [...prev, entry]);
        },
      });
    }
    return orchestratorRef.current;
  }, [setTripPlan, setLiveView, setNodeCache, setActivity]);

  /** Send an action to the orchestrator (always hits LLM) */
  const sendToOrchestrator = useCallback(
    async (action: UserAction) => {
      const message = actionToMessage(action);

      // Don't add select_node to chat messages — it's UI navigation
      if (action.type !== "select_node") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "user" as const,
            content: action.type === "chat" ? action.message : message,
            timestamp: Date.now(),
          },
        ]);
      }

      setIsRunning(true);
      setActivity([]);
      try {
        const orchestrator = getOrchestrator();
        console.log("[orchestrator] sending:", message);
        const response = await orchestrator(message);
        console.log("[orchestrator] response:", response);

        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: response,
            timestamp: Date.now(),
          },
        ]);
      } catch (err) {
        console.error("[orchestrator] error:", err);
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: `Error: ${err instanceof Error ? err.message : String(err)}`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsRunning(false);
      }
    },
    [getOrchestrator, setChatMessages, setActivity]
  );

  // Ref so selectNode can call sendToOrchestrator without dep cycle
  const sendRef = useRef(sendToOrchestrator);
  sendRef.current = sendToOrchestrator;

  /** Main entry point for all user actions */
  const run = useCallback(
    (action: UserAction) => {
      // For node selection: check cache first, only hit LLM on miss
      if (action.type === "select_node") {
        const cached = nodeCacheRef.current[action.nodeId];
        if (cached) {
          console.log("[cache hit]", action.nodeId, cached.phase);
          setLiveView(cached);
          return;
        }
        // Cache miss — ask orchestrator
        sendRef.current(action);
        return;
      }

      sendRef.current(action);
    },
    [setLiveView]
  );

  return { run, isRunning };
}
