import { castle } from '#config/castle'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = castle.table.book()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.string('uuid').notNullable().unique()

      t.string('title')

      t.string('author').nullable()
      t.string('author_uuid').nullable()

      t.timestamp('created_at')
      t.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
