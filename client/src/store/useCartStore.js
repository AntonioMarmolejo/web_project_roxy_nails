import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const compute = (items) => ({
  items,
  count: items.reduce((s, i) => s + i.qty, 0),
  total: items.reduce((s, i) => s + i.price * i.qty, 0),
})

export const useCartStore = create(
  persist(
    (set, get) => ({
      ...compute([]),
      drawerOpen: false,

      openDrawer:  () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      addItem: (product) => {
        const items = get().items
        const existing = items.find(i => i._id === product._id)
        set(compute(
          existing
            ? items.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i)
            : [...items, { ...product, qty: 1 }]
        ))
      },

      removeItem: (id) => set(compute(get().items.filter(i => i._id !== id))),

      updateQty: (id, qty) => {
        if (qty < 1) { set(compute(get().items.filter(i => i._id !== id))); return }
        set(compute(get().items.map(i => i._id === id ? { ...i, qty } : i)))
      },

      clearCart: () => set(compute([])),
    }),
    {
      name: 'rn-cart',
      partialize: (s) => ({ items: s.items, count: s.count, total: s.total }),
    }
  )
)
