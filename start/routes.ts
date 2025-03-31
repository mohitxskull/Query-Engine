/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { signInThrottle, signUpThrottle, throttle } from './limiter.js'
import { ProcessingException } from '@folie/castle/exception'

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router
              .get('session', [() => import('#controllers/auth/session_controller')])
              .use(middleware.auth())

            router
              .post('sign-out', [() => import('#controllers/auth/sign_out_controller')])
              .use(middleware.auth())

            router
              .post('sign-in', [() => import('#controllers/auth/sign_in_controller')])
              .use([signInThrottle])

            router
              .post('sign-up', [() => import('#controllers/auth/sign_up_controller')])
              .use([signUpThrottle])

            router
              .group(() => {
                router.put('', [() => import('#controllers/auth/password/update_controller')])
              })
              .prefix('password')
              .use(middleware.auth())

            router
              .group(() => {
                router.put('', [() => import('#controllers/auth/profile/update_controller')])
              })
              .prefix('profile')
              .use(middleware.auth())
          })
          .prefix('auth')

        router
          .group(() => {
            router.get('', [() => import('#controllers/book/list_controller')])

            router.post('query', [() => import('#controllers/book/query_controller')])

            router.get(':bookId', [() => import('#controllers/book/show_controller')])
          })
          .prefix('book')
          .use(middleware.auth())

        router.get('ping', [() => import('#controllers/ping_controller')])
      })
      .prefix('v1')
  })
  .prefix('api')
  .use(throttle)

router
  .any('*', (ctx) => {
    throw new ProcessingException('Route not found', {
      status: 'NOT_FOUND',
      meta: {
        public: {
          route: ctx.request.url(),
          method: ctx.request.method(),
        },
      },
    })
  })
  .use(throttle)
