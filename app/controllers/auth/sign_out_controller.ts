import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async ({ ctx }) => {
    await ctx.auth.session.delete()

    return {
      message: 'You have successfully signed out!',
    }
  })
}
