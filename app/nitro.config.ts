// Vercel-specific Nitro 3 runtime entry format: emit Node handler instead of Fetch object.
export default {
  vercel: { entryFormat: 'node' },
}
