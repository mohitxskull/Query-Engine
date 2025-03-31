import Session from '#models/session'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options?: { bypass?: true }) {
    try {
      const session = await Session.manager.authenticate(ctx)

      ctx.auth = {
        ...ctx.auth,
        session,
      }

      return next()
    } catch (error) {
      if (options?.bypass === true) {
        return next()
      }

      throw error
    }
  }
}
