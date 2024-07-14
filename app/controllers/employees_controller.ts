import Employee from '#models/employee'
import type { HttpContext } from '@adonisjs/core/http'

const tableConfig = {
  baseUrl: '/employees',
  pagination: { perPage: 10 },
  select: ['city', 'name', 'salary', 'position'],
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
  searchable: ['name', 'city', 'position'],
}

export default class EmployeesController {
  async index(ctx: HttpContext) {
    const { view } = ctx

    const employees = await Employee.query().datatable(ctx.request.all(), tableConfig)

    return view.render('pages/employees/index', { employees })
  }
}
