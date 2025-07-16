import router from '@adonisjs/core/services/router'
import Employee from '#models/employee'
import { employeeValidator, testEmployeeValidator } from '#validators/employee'
import type { HttpContext } from '@adonisjs/core/http'

const tableConfig = {
  defaultSortKey: 'created_at',
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
    updated_at: 'updated_at',
    created_at: 'created_at',
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
    const { turboFrame, view } = ctx

    const employees = await Employee.query().datatable(ctx.request.all(), tableConfig)

    if (turboFrame.isTurboFrame()) {
      return turboFrame.render('pages/employees/index', { employees })
    }
    return view.render('pages/employees/index', { employees })
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

  async store({ request, turboStream, response }: HttpContext) {
    const columns = await request.validateUsing(employeeValidator)
    await Employee.create(columns)

    const redirectUrl = router.builder().qs({ sort: 'created_at', page: 1 }).make('employees.index')

    if (turboStream.isTurboStream()) {
      return (
        turboStream
          // .flash('notice', 'Employee created successfully', {
          //   link: { url: redirectUrl, label: 'View' },
          // })
          .invoke('employee-form', 'close')
          .render()
      )
    }

    return response.redirect().toRoute('employees.create')
  }

  async update({ params, request, turboStream }: HttpContext) {
    const columns = await request.validateUsing(employeeValidator)

    const employee = await Employee.findOrFail(params.id)

    const saved = await employee.merge(columns).save()

    return turboStream
      .replace('pages/employees/_table_row', { employee: saved }, 'table-row-' + params.id)
      .flash('notice', 'Saved')
      .render()
  }

  async delete({ params, turboStream }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)

    await employee.delete()

    return turboStream.remove('table-row-' + params.id).render()
  }
}
