import { atom } from "jotai"
import type { LiveView } from "../types"

export const liveViewAtom = atom<LiveView>({
  nodeId: "",
  phase: "empty",
  agents: [],
  flights: [],
  hotels: [],
  discoveries: [],
  decidedItem: null,
  title: "Explore",
  subtitle: "",
})
