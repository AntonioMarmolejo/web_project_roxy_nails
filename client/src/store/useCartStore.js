import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product) => {
    const existing = get().items.find(i => i._id === product._id)
    if (existing) {
      set({ items: get().items.map(i =>
        i._id === product._id ? { ...i, qty: i.qty + 1 } : i
      )})
    } else {
      set({ items: [...get().items, { ...product, qty: 1 }] })
    }
  },

  removeItem: (id) => set({ items: get().items.filter(i => i._id !== id) }),

  updateQty: (id, qty) => {
    if (qty < 1) return get().removeItem(id)
    set({ items: get().items.map(i => i._id === id ? { ...i, qty } : i) })
  },

  clearCart: () => set({ items: [] }),

  get total() {
    return get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.qty, 0)
  },
}))
