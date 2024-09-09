import { EmployeeFactory } from '#database/factories/employee_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await EmployeeFactory.createMany(900)
  }
}
