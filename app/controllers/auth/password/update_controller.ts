import { acceptablePassword } from '#helpers/acceptable_password'
import { PasswordSchema } from '#validators/index'
import hash from '@adonisjs/core/services/hash'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      oldPassword: PasswordSchema,
      newPassword: PasswordSchema,
    })
  )

  handle = handler(async ({ ctx }) => {
    const [payload, user] = await Promise.all([
      ctx.request.validateUsing(this.input),
      ctx.auth.session.getUser(),
    ])

    if (payload.oldPassword === payload.newPassword) {
      throw new ProcessingException('New password cannot be the same as old password', {
        source: 'newPassword',
      })
    }

    if (!(await hash.verify(user.password, payload.oldPassword))) {
      throw new ProcessingException('Invalid password', {
        source: 'oldPassword',
      })
    }

    const passRes = acceptablePassword(payload.newPassword, [
      user.firstName,
      user.lastName,
      user.email,
    ])

    if (!passRes.result) {
      throw new ProcessingException(passRes.reason, {
        source: 'newPassword',
      })
    }

    user.password = payload.newPassword

    await user.save()

    return {
      message: 'You have successfully updated your password',
    }
  })
}
