/// <reference path="../reference.ts" />

import { InferController, endpoint } from '@folie/blueprint-lib'

/*
 * This is an auto-generated file. Changes made to this file will be lost.
 * Run `nr ace blueprint:generate` to update it.
 */

export type V1AuthSessionRoute = InferController<
  (typeof import('../../app/controllers/auth/session_controller.ts'))['default']
>
export type V1AuthSignOutRoute = InferController<
  (typeof import('../../app/controllers/auth/sign_out_controller.ts'))['default']
>
export type V1AuthSignInRoute = InferController<
  (typeof import('../../app/controllers/auth/sign_in_controller.ts'))['default']
>
export type V1AuthSignUpRoute = InferController<
  (typeof import('../../app/controllers/auth/sign_up_controller.ts'))['default']
>
export type V1AuthPasswordUpdateRoute = InferController<
  (typeof import('../../app/controllers/auth/password/update_controller.ts'))['default']
>
export type V1AuthProfileUpdateRoute = InferController<
  (typeof import('../../app/controllers/auth/profile/update_controller.ts'))['default']
>
export type V1BookListRoute = InferController<
  (typeof import('../../app/controllers/book/list_controller.ts'))['default']
>
export type V1BookQueryRoute = InferController<
  (typeof import('../../app/controllers/book/query_controller.ts'))['default']
>
export type V1BookShowRoute = InferController<
  (typeof import('../../app/controllers/book/show_controller.ts'))['default']
>
export type V1PingRoute = InferController<
  (typeof import('../../app/controllers/ping_controller.ts'))['default']
>

export const endpoints = {
  V1_AUTH_SESSION: endpoint<V1AuthSessionRoute>({
    form: false,
    url: '/api/v1/auth/session',
    method: 'GET',
  }),
  V1_AUTH_SIGN_OUT: endpoint<V1AuthSignOutRoute>({
    form: false,
    url: '/api/v1/auth/sign-out',
    method: 'POST',
  }),
  V1_AUTH_SIGN_IN: endpoint<V1AuthSignInRoute>({
    form: false,
    url: '/api/v1/auth/sign-in',
    method: 'POST',
  }),
  V1_AUTH_SIGN_UP: endpoint<V1AuthSignUpRoute>({
    form: false,
    url: '/api/v1/auth/sign-up',
    method: 'POST',
  }),
  V1_AUTH_PASSWORD_UPDATE: endpoint<V1AuthPasswordUpdateRoute>({
    form: false,
    url: '/api/v1/auth/password',
    method: 'PUT',
  }),
  V1_AUTH_PROFILE_UPDATE: endpoint<V1AuthProfileUpdateRoute>({
    form: false,
    url: '/api/v1/auth/profile',
    method: 'PUT',
  }),
  V1_BOOK_LIST: endpoint<V1BookListRoute>({ form: false, url: '/api/v1/book', method: 'GET' }),
  V1_BOOK_QUERY: endpoint<V1BookQueryRoute>({
    form: false,
    url: '/api/v1/book/query',
    method: 'POST',
  }),
  V1_BOOK_SHOW: endpoint<V1BookShowRoute>({
    form: false,
    url: '/api/v1/book/{{ bookId }}',
    method: 'GET',
  }),
  V1_PING: endpoint<V1PingRoute>({ form: false, url: '/api/v1/ping', method: 'GET' }),
} as const
