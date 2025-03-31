import { setting } from '#config/setting'
import vine from '@vinejs/vine'

export const NameSchema = vine.string().minLength(2).maxLength(100)

export const GmailSchema = vine.string().email({
  host_whitelist: ['gmail.com'],
})

export const PasswordSchema = vine
  .string()
  .minLength(setting.passwordRequirement.size.min)
  .maxLength(setting.passwordRequirement.size.max)

export const BookTitleSchema = vine.string().minLength(1).maxLength(20)
