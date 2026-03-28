import { atom } from "jotai"
import type { LiveView } from "../types"

const emptyView: LiveView = {
  nodeId: "",
  phase: "empty",
  agents: [],
  flights: [],
  hotels: [],
  discoveries: [],
  decidedItem: null,
  title: "Explore",
  subtitle: "",
}

/** Currently displayed right-panel view */
export const liveViewAtom = atom<LiveView>(emptyView)

/** Per-node result cache: nodeId → LiveView snapshot */
export const nodeResultCacheAtom = atom<Record<string, LiveView>>({})

export { emptyView }
