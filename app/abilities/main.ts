import { Bouncer } from '@adonisjs/bouncer'

export const editPost = Bouncer.ability(() => {
  return true
})
