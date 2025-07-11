import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class FormField extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare formId: string

  @column()
  declare type: string

  @column()
  declare label: string

  @column()
  declare defaultValue: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
