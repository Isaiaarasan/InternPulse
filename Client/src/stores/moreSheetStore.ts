import { create } from 'zustand'

interface MoreSheetState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useMoreSheetStore = create<MoreSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
