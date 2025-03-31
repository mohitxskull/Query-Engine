// @ts-nocheck

/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(120).every('1 minute')
})

export const signInThrottle = limiter.define('sign-in', (ctx) => {
  return limiter.allowRequests(5).every('1 hour').usingKey(`sign_in_${ctx.request.ip()}`)
})

export const signUpThrottle = limiter.define('sign-up', (ctx) => {
  return limiter.allowRequests(20).every('1 hour').usingKey(`sign_up_${ctx.request.ip()}`)
})
