import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { squid } from '#config/squid'
import cache from '@adonisjs/cache/services/main'
import { castle } from '#config/castle'
import { ModelCache } from '@folie/castle'
import { serializeDT } from '@folie/castle/helpers'

export default class Book extends BaseModel {
  static table = castle.table.book()

  // Serialize =============================

  static $serialize(row: Book) {
    return {
      ...row.$toJSON(),

      id: squid.book.encode(row.id),

      createdAt: serializeDT(row.createdAt),
      updatedAt: serializeDT(row.updatedAt),
    }
  }

  $serialize() {
    return Book.$serialize(this)
  }

  $toJSON() {
    return {
      id: this.id,

      uuid: this.uuid,
      title: this.title,
      author: this.author,
      authorUuid: this.authorUuid,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  // Cache =============================

  static $cache() {
    return new ModelCache(Book, cache.namespace(this.table), ['metric'])
  }

  $cache() {
    return Book.$cache().row(this)
  }

  // Columns =============================

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare title: string

  @column()
  declare author: string | null

  @column()
  declare authorUuid: string | null

  // DateTime =============================

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks =============================

  // Relations =============================

  // Extra ======================================
}
