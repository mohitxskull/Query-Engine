import { setting } from '#config/setting'
import User from '#models/user'
import { GmailSchema, NameSchema, PasswordSchema } from '#validators/index'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { acceptablePassword } from '#helpers/acceptable_password'
import db from '@adonisjs/lucid/services/db'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'

export default class Controller {
  input = vine.compile(
    vine.object({
      firstName: NameSchema,
      lastName: NameSchema,
      email: GmailSchema,
      password: PasswordSchema,
      confirmPassword: PasswordSchema.sameAs('password'),
    })
  )

  handle = handler(async ({ ctx }) => {
    if (!setting.signUp.enabled) {
      throw new ProcessingException('Sign-up is disabled', {
        status: 'FORBIDDEN',
      })
    }

    const payload = await ctx.request.validateUsing(this.input)

    const exist = await User.findBy('email', payload.email)

    if (exist) {
      throw new ProcessingException('Email already exists', {
        source: 'email',
      })
    }

    const passRes = acceptablePassword(payload.password, [
      payload.firstName,
      payload.lastName,
      payload.email,
    ])

    if (!passRes.result) {
      throw new ProcessingException(passRes.reason, {
        source: 'password',
      })
    }

    const trx = await db.transaction()

    try {
      const user = await User.create(
        {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          verifiedAt: DateTime.utc(),
        },
        {
          client: trx,
        }
      )

      await trx.commit()

      return {
        user: user.$serialize(),
        message: 'You have successfully signed up!',
      }
    } catch (error) {
      await trx.rollback()

      throw error
    }
  })
}
