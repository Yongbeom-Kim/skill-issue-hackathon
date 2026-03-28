import { useState, useCallback, useRef } from "react";
import { useSetAtom } from "jotai";
import { tripPlanAtom, updateNodeInTree } from "../atoms/tripPlan";
import { liveViewAtom } from "../atoms/liveView";
import { chatMessagesAtom } from "../atoms/chat";
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
      return `User selected node "${action.nodeId}". Research and present options for this node.`;
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
  const setChatMessages = useSetAtom(chatMessagesAtom);
  const orchestratorRef = useRef<ReturnType<typeof createTripPlannerOrchestrator> | null>(null);

  const getOrchestrator = useCallback(() => {
    if (!orchestratorRef.current) {
      orchestratorRef.current = createTripPlannerOrchestrator({
        onUpdateDecisionTree: (input) => {
          console.log("[update_decision_tree]", input);
          setTripPlan((prev) => applyTreeUpdate(prev, input));
        },
        onUpdateRealtimeView: (input) => {
          console.log("[update_realtime_view]", input);
          setLiveView(applyViewUpdate(input));
        },
      });
    }
    return orchestratorRef.current;
  }, [setTripPlan, setLiveView]);

  const run = useCallback(
    async (action: UserAction) => {
      const message = actionToMessage(action);

      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: action.type === "chat" ? action.message : message,
          timestamp: Date.now(),
        },
      ]);

      setIsRunning(true);
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
    [getOrchestrator, setChatMessages]
  );

  return { run, isRunning };
}
