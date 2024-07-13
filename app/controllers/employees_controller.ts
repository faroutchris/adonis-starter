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
    const { turboFrame } = ctx

    const employees = await Employee.query().datatable(ctx.request.all(), tableConfig)

    const appendQueryString = (q: Record<string, string>) => {
      const newQs = { ...ctx.request.all(), ...q }

      let str = Object.entries(newQs)
        .map(([key, val]) => `${key}=${val}`)
        .join('&')

      return tableConfig.baseUrl + '?' + str
    }

    const getQueryString = (key: string) => {
      return ctx.request.all()[key]
    }

    return turboFrame.render('pages/employees/index', {
      employees,
      appendQueryString,
      getQueryString,
    })
  }
}
