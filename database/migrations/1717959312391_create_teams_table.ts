import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.string('description').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Pivot table
    this.schema.createTable('team_user', (table) => {
      table.increments('id')
      table.integer('team_id').unsigned().references('id').inTable('teams').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.unique(['user_id', 'skill_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('team_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
