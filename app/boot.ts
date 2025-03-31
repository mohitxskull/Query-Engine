import logger from '@adonisjs/core/services/logger'
import User from '#models/user'
import { DateTime } from 'luxon'

export const boot = async () => {
  logger.info('Initializing app...')

  await User.firstOrCreate(
    {
      email: 'mohitxskull@gmail.com',
    },
    {
      email: 'mohitxskull@gmail.com',
      password: 'master$master',
      firstName: 'Skull',
      lastName: 'Dot',
      verifiedAt: DateTime.utc(),
    }
  )

  logger.info('App initialized')
}
