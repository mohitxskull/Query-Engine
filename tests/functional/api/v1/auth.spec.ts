import { test } from '@japa/runner'

test.group('API V1 Auth', () => {
  test('Sign In', async ({ assert, resource }) => {
    const mna = await resource.getUser()

    const response = await resource.api.endpoint('V1_AUTH_SIGN_IN').call({
      email: mna.user.email,
      password: resource.password,
    })

    assert.exists(response.token)
    assert.isString(response.token)
  })

  test('Session', async ({ assert, resource }) => {
    const cus = await resource.getUser({
      email: 'session-user@gmail.com',
    })

    const response = await cus.api.endpoint('V1_AUTH_SESSION').call(undefined)

    assert.equal(response.session.email, cus.user.email)
  })

  test('Profile Update', async ({ assert, resource }) => {
    const mna = await resource.getUser({
      email: 'session-user@gmail.com',
    })

    const updatedManagement = resource.info({
      email: mna.user.email,
      firstName: 'Updated',
      lastName: 'Management',
    })

    const response = await mna.api.endpoint('V1_AUTH_PROFILE_UPDATE').call({
      firstName: updatedManagement.firstName,
      lastName: updatedManagement.lastName,
    })

    assert.equal(response.user.firstName, updatedManagement.firstName)
    assert.equal(response.user.lastName, updatedManagement.lastName)
  })

  test('Password Update', async ({ assert, resource }) => {
    const mna = await resource.getUser({
      email: 'session-user@gmail.com',
    })

    const newPassword = 'sick123$'

    await resource.catch(
      mna.api.endpoint('V1_AUTH_PASSWORD_UPDATE').call({
        oldPassword: resource.password,
        newPassword,
      })
    )

    const signInAttempt = await resource.catch(
      mna.api.endpoint('V1_AUTH_SIGN_IN').call({
        email: mna.user.email,
        password: newPassword,
      })
    )

    assert.exists(signInAttempt.token)
    assert.isString(signInAttempt.token)
  })
})
