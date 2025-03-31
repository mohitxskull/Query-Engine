import { defineConfig } from '@folie/blueprint'

const config = defineConfig({
  groups: {
    api: /^\/api\//,
  },
  key: (k) => k.replace(/^\sapi\s+/, ''),
})

export default config
