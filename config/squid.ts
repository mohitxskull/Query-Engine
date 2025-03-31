import env from '#start/env'
import { SquidModule } from '@folie/squid'

const squidModule = new SquidModule(env.get('SQUID_KEY'))

export const squid = squidModule.group({
  user: {
    prefixBase: 'usr',
  },
  session: {
    prefixBase: 'ses',
  },
  book: {
    prefixBase: 'bok',
  },
  rent: {
    prefixBase: 'ren',
  },
})
