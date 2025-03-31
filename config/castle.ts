import { CastleModule } from '@folie/castle'

export const castle = new CastleModule({
  config: {
    table: {
      user: 'users',
      session: 'sessions',
      book: 'books',
    },
  },
})
