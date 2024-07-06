import Datatable from '#extensions/datatable/data_table'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const tableConfig = {
  baseUrl: '/employees',
  select: ['*'],
  // mark filterable fields
  filterable: {
    city: 'city', // filterByCity
    name: 'name', // filterByName
  },
  // mark sortable fields
  sortable: {
    salary: 'salary', // sortBySalary
    name: 'name', // sortByName
  },
  // mark searchable fields
  searchable: 'name',
}

export default class EmployeesController {
  async index(ctx: HttpContext) {
    const { turboFrame } = ctx

    const employees = await new Datatable(ctx, () => db.from('employees'), tableConfig).create()

    return turboFrame.render('pages/employees/index', { employees })
  }
}
