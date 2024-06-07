import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected entriesTableName = 'feed_entries'
  protected enclosureTableName = 'feed_enclosures'

  async up() {
    this.schema.createTable(this.entriesTableName, (table) => {
      table.uuid('id').primary()
      table.uuid('feed_id').references('id').inTable('feeds').onDelete('CASCADE')
      table.string('guid').notNullable()
      table.text('title').notNullable()
      table.string('url', 2048).notNullable()
      table.text('description').notNullable()
      table.text('links').nullable()
      table.string('updated').nullable()
      table.string('published').nullable()
      table.text('authors').nullable()
      table.text('contributors').nullable()
      table.timestamp('created_at', { useTz: false })
      table.timestamp('updated_at', { useTz: false })
      // :categories,
      // :source
    })

    this.schema.createTable(this.enclosureTableName, (table) => {
      table.uuid('id').primary()
      table.uuid('entry_id').references('id').inTable(this.entriesTableName).onDelete('CASCADE')
      table.string('type').nullable()
      table.string('length').nullable()
      table.string('url', 2048).nullable()
      table.timestamp('created_at', { useTz: false })
      table.timestamp('updated_at', { useTz: false })
    })
  }

  async down() {
    this.schema.dropTable(this.enclosureTableName)
    this.schema.dropTable(this.entriesTableName)
  }
}
