import { castle } from '#config/castle'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = castle.table.user()

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')

      t.string('first_name', 255).nullable()
      t.string('last_name', 255).nullable()

      t.string('email', 200).notNullable().unique()

      t.text('password').notNullable()

      t.timestamp('created_at')
      t.timestamp('updated_at')
      t.timestamp('verified_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
