import { setting } from '#config/setting'
import { zxcvbn } from '#config/zxcvbn'
import string from '@adonisjs/core/helpers/string'

/**
 * Validates a password against defined security requirements.
 */
export const acceptablePassword = (
  password: string,
  userInputs?: string[]
): { result: true } | { result: false; reason: string } => {
  // Check if password length is less than the minimum required length.
  if (password.length < setting.passwordRequirement.size.min) {
    return {
      result: false,
      reason: `Too short (min length ${setting.passwordRequirement.size.min})`,
    }
  } // Check if password length exceeds the maximum allowed length.

  if (password.length > setting.passwordRequirement.size.max) {
    return {
      result: false,
      reason: `Too long (max length ${setting.passwordRequirement.size.max})`,
    }
  } // Analyze password strength using zxcvbn library.

  const result = zxcvbn(password, userInputs) // Check if the password can be cracked too quickly.

  if (
    result.crackTimesSeconds.offlineSlowHashing1e4PerSecond < setting.passwordRequirement.crackTime
  ) {
    return {
      result: false,
      reason: `Can be cracked in ${result.crackTimesDisplay.offlineSlowHashing1e4PerSecond} (min ${string.seconds.format(setting.passwordRequirement.crackTime, true)})`,
    }
  } // Check if the password score is below the minimum required score.

  if (result.score <= setting.passwordRequirement.score) {
    return {
      result: false,
      reason: `Too weak (min score ${setting.passwordRequirement.score})`,
    }
  } // If all checks pass, the password is considered acceptable.

  return {
    result: true,
  }
}
