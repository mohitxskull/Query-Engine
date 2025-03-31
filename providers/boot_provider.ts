import type { ApplicationService } from '@adonisjs/core/types'
import { boot } from '../app/boot.js'

export default class BootProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    if (['web'].includes(this.app.getEnvironment())) {
      await boot()
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
