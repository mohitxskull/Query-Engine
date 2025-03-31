import { setting } from '#config/setting'
import Session from '#models/session'
import User from '#models/user'
import { GmailSchema, PasswordSchema } from '#validators/index'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import { handler } from '@folie/castle/helpers'
import { ProcessingException } from '@folie/castle/exception'

export default class Controller {
  input = vine.compile(
    vine.object({
      email: GmailSchema,
      password: PasswordSchema,
    })
  )

  handle = handler(async ({ ctx }) => {
    if (!setting.signIn.enabled) {
      throw new ProcessingException('Sign-in is disabled', {
        status: 'FORBIDDEN',
      })
    }

    const payload = await ctx.request.validateUsing(this.input)

    const user = await User.findBy('email', payload.email)

    if (!user) {
      await hash.make(payload.password)

      throw new ProcessingException('Invalid credentials', {
        meta: {
          email: payload.email,
          message: "User doesn't exist",
        },
      })
    }

    if (!(await hash.verify(user.password, payload.password))) {
      throw new ProcessingException('Invalid credentials', {
        meta: {
          email: payload.email,
          message: 'Invalid password',
        },
      })
    }

    if (!user.verifiedAt) {
      throw new ProcessingException('Email not verified', {
        source: 'email',
      })
    }

    const session = await Session.manager.create(user)

    return {
      token: session.value.release(),
      message: `You have successfully signed in!`,
    }
  })
}
