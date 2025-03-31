import { endpoints } from '../blueprint/api/schema.js'
import env from '#start/env'
import { Gate, GateError } from '@folie/gate'
import User from '#models/user'
import { inspectLog } from '@folie/castle/helpers'

export class TestResources {
  baseURL = new URL(`http://${env.get('HOST')}:${env.get('PORT')}`)

  endpoints = { ...endpoints }

  api = new Gate({
    baseURL: this.baseURL,
    endpoints: this.endpoints,
  })

  password = 'master'

  info = (params?: { email?: string; firstName?: string; lastName?: string }) => ({
    email: params?.email ?? `auto-user@gmail.com`,
    password: this.password,
    firstName: params?.firstName ?? 'Auto',
    lastName: params?.lastName ?? 'User',
  })

  getUser = async (params?: { email?: string; firstName?: string; lastName?: string }) => {
    const info = this.info({
      email: params?.email,
      firstName: params?.firstName,
      lastName: params?.lastName,
    })

    let user = await User.findBy('email', info.email)

    if (!user) {
      user = await User.create(info)
    }

    const { token } = await this.api.endpoint('V1_AUTH_SIGN_IN').call({
      email: info.email,
      password: this.password,
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      user: user,
      api: new Gate({
        baseURL: this.baseURL,
        endpoints: this.endpoints,
        token: token,
      }),
    }
  }

  catch = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      return await promise
    } catch (error) {
      if (error instanceof GateError) {
        inspectLog(error.toJSON())

        throw new Error('Gate Error')
      } else {
        throw error
      }
    }
  }
}

export const testResources = new TestResources()

export type TestManagement = Awaited<ReturnType<typeof testResources.getUser>>
