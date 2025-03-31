// import env from '#start/env'
import { defineConfig, store, drivers } from '@adonisjs/cache'
import { superjson } from '@folie/castle/miscellaneous/super_json'

const cacheConfig = defineConfig({
  default: 'default',

  stores: {
    default: store().useL1Layer(drivers.memory()),

    // database: store().useL2Layer(drivers.database({ connectionName: env.get('DB_TYPE') })),
  },

  serializer: {
    deserialize: superjson.parse,
    serialize: superjson.stringify,
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
