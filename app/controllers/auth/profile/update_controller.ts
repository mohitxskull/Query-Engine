import { NameSchema } from '#validators/index'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      firstName: NameSchema.optional(),
      lastName: NameSchema.optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const [payload, user] = await Promise.all([
      ctx.request.validateUsing(this.input),
      ctx.auth.session.getUser(),
    ])

    if (payload.firstName) {
      user.firstName = payload.firstName
    }

    if (payload.lastName) {
      user.lastName = payload.lastName
    }

    await user.save()

    return { user: user.$serialize(), message: 'Your profile has been updated' }
  })
}
