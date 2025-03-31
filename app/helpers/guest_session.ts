import encryption from '@adonisjs/core/services/encryption'
import string from '@adonisjs/core/helpers/string'

export const createGuestSession = async () => {
  const session = encryption.encrypt(string.random(10), undefined, 'guest_session')

  return session
}

export const decryptGuestSession = async (session: string) => {
  const decrypted = await encryption.decrypt(session, 'guest_session')

  if (typeof decrypted !== 'string' || decrypted.length !== 10) {
    return null
  }

  return decrypted
}
