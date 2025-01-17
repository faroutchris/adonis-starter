import Employee from '#models/employee'
import { employeeUpdateValidator } from '#validators/employee'
import type { HttpContext } from '@adonisjs/core/http'

const tableConfig = {
  baseUrl: '/employees',
  pagination: { perPage: 10 },
  select: ['*'],
  // mark filterable fields
  // TODO - refactor to string[]
  filterable: {
    city: 'city',
    name: 'name',
    salary: 'salary',
  },
  // mark sortable fields
  sortable: {
    salary: 'salary',
    name: 'name',
    city: 'city',
  },
  // mark searchable fields
  searchable: ['name', 'city', 'position'],
}

export default class EmployeesController {
  async index(ctx: HttpContext) {
    const { turboFrame } = ctx

    const employees = await Employee.query().datatable(ctx.request.all(), tableConfig)

    // return response.send(employees)

    return turboFrame.render('pages/employees/index', { employees })
  }

  async update({ params, request, turboStream }: HttpContext) {
    const columns = await request.validateUsing(employeeUpdateValidator)

    const employee = await Employee.findOrFail(params.id)

    const saved = await employee.merge(columns).save()

    return turboStream
      .update('pages/employees/_table_row', { employee: saved }, `table-row-${params.id}`)
      .render()
  }

  async delete({ params, turboStream }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)

    await employee.delete()

    return turboStream.remove(`table-row-${params.id}`).render()
  }
}
