import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'form_fields'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable()

      table.uuid('form_id').notNullable().references('id').inTable('forms').onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('label').notNullable()
      table.string('default_value')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
