import { defineConfig } from 'nitro'

// Use Nitro's native Node handler interface for Vercel SSR functions.
export default defineConfig({
  vercel: { entryFormat: 'node' },
})
