import Employee from '#models/employee'
import { employeeValidator } from '#validators/employee'
import type { HttpContext } from '@adonisjs/core/http'

const tableConfig = {
  defaultSortKey: 'id',
  baseUrl: '/employees',
  pagination: { perPage: 10 },
  select: ['*'],
  // mark filterable fields
  filterable: {
    city: 'city',
    name: 'name',
    salary: 'salary',
  },
  // mark sortable fields
  sortable: {
    id: 'id',
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

    return turboFrame.render('pages/employees/index', { employees })
  }

  async create({ turboFrame, view }: HttpContext) {
    if (turboFrame.isTurboFrame()) {
      return turboFrame.render('pages/employees/create')
    }
    return view.render('pages/employees/create')
  }

  async edit({ turboFrame, view, params }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)

    if (turboFrame.isTurboFrame()) {
      return turboFrame.render('pages/employees/edit', { employee })
    }
    return view.render('pages/employees/edit')
  }

  async store({ response, request, turboStream }: HttpContext) {
    console.log(turboStream.isTurboStream())
    const columns = await request.validateUsing(employeeValidator)

    const employee = await Employee.create(columns)

    const saved = await employee.save()
    console.log(saved)
    return turboStream
      .prepend('pages/employees/_table_row.edge', { employee: saved }, 'table-body')
      .render()
    // add as first entry in table
    return response.redirect().back()
  }

  async update({ params, request, turboStream }: HttpContext) {
    const columns = await request.validateUsing(employeeValidator)

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
