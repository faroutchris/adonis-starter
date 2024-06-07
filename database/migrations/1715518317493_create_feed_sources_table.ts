import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'feeds'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('url', 2048).notNullable().unique()
      table.string('last_modified', 1024).nullable()
      table.string('etag', 1024).nullable()
      table.timestamp('next_fetch', { useTz: false }).nullable()
      table.text('title').nullable()
      table.text('description').nullable()
      table.text('links').nullable()
      table.string('updated').nullable()
      table.text('authors').nullable()
      table.text('contributors').nullable()
      table.string('language').nullable()
      table.text('icon').nullable()
      table.text('logo').nullable()
      table.text('copyright').nullable()
      table.timestamp('created_at', { useTz: false })
      table.timestamp('updated_at', { useTz: false })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
