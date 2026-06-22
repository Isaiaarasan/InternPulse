import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

interface ChatState {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  createSession: (firstMessage: string) => string;
  setActiveSession: (id: string | null) => void;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      sessions: [],
      activeSessionId: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      createSession: (firstMessage: string) => {
        const id = crypto.randomUUID();
        const newSession: ChatSession = {
          id,
          title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : ''),
          updatedAt: Date.now(),
          messages: [
            {
              role: "assistant",
              content: "Hi there! I'm InternPulse AI. How can I help you today?",
            },
            {
              role: "user",
              content: firstMessage,
            }
          ],
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
        activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
      })),

      addMessage: (sessionId, message) => set((state) => ({
        sessions: state.sessions.map(s => 
          s.id === sessionId 
            ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
            : s
        ).sort((a, b) => b.updatedAt - a.updatedAt)
      })),

      clearHistory: () => set({ sessions: [], activeSessionId: null }),
    }),
    {
      name: 'ai-chat-storage',
      partialize: (state) => ({ sessions: state.sessions, activeSessionId: state.activeSessionId }),
    }
  )
)
