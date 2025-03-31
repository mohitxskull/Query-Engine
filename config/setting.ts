import string from '@adonisjs/core/helpers/string'

export const setting = {
  signUp: {
    enabled: true,
  },

  signIn: {
    enabled: true,
  },

  passwordRequirement: {
    crackTime: string.seconds.parse('1 year')!,
    score: 3,
    size: {
      min: 8,
      max: 32,
    },
  },

  books: {
    perUser: 3,
  },
}
