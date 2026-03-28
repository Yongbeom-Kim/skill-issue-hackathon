// frontend/src/atoms/chat.ts
import { atom } from "jotai"
import type { ChatMessage } from "../types"

export const chatMessagesAtom = atom<ChatMessage[]>([])
