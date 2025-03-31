import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async ({ ctx }) => {
    const user = await ctx.auth.session.getUser()

    return { session: user.$serialize() }
  })
}
