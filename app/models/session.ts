import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { squid } from '#config/squid'
import { castle } from '#config/castle'
import { serializeDT } from '@folie/castle/helpers'
import { Secret } from '@adonisjs/core/helpers'
import { SessionManager } from '@folie/castle'

export default class Session extends BaseModel {
  static table = castle.table.session()

  static manager = new SessionManager(Session)

  // ====================================

  static $serialize(row: Session) {
    return {
      id: squid.session.encode(row.id),
      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
      expiresAt: serializeDT(row.expiresAt),

      /**
       * Last used at
       */
      usedAt: serializeDT(row.usedAt),
    }
  }

  $serialize(this: Session) {
    return Session.$serialize(this)
  }

  $toJSON(this: Session) {
    return {
      id: this.id,
      hash: this.hash,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
      usedAt: this.usedAt,
    }
  }

  // ====================================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hash: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  async getUser(this: Session) {
    await this.load('user')

    return this.user
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare usedAt: DateTime | null

  declare value: Secret<string> | null
  declare secret: Secret<string> | null
}
