import { handler } from '@folie/castle/helpers'

export default class Controller {
  handle = handler(async () => {
    return { message: 'pong' }
  })
}
