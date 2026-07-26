import { create } from 'zustand'

export const useAccountDrawerStore = create((set) => ({
    open: false,
    toggle: () => set(s => ({ open: !s.open })),
    close: () => set({ open: false }),
}))
