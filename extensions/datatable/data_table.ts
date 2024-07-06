import { HttpContext } from '@adonisjs/core/http'
import { LucidModel } from '@adonisjs/lucid/types/model'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

type Config = {
  baseUrl: string
  searchable: string
  select: string[]
  sortable: Record<string, string>
  filterable: Record<string, string>
}

export default class Datatable {
  ctx: HttpContext
  query: () => DatabaseQueryBuilderContract<LucidModel>
  config: Config

  constructor(
    ctx: HttpContext,
    query: () => DatabaseQueryBuilderContract<LucidModel>,
    config: Config
  ) {
    this.ctx = ctx
    this.query = query
    this.config = config
  }

  async create() {
    const { page, perPage } = this.ctx.request.all()

    const query = this.query.call(this).select(...this.config.select)

    this.applySorting(query)
    this.applyFilter(query)
    this.applySearch(query)

    const q = await query.paginate(Number(page) || 1, Number(perPage) || 20)

    return q.baseUrl(this.config.baseUrl).queryString(this.ctx.request.all())
  }

  applySearch(query: DatabaseQueryBuilderContract<LucidModel>) {
    const { search } = this.ctx.request.all()

    if (search) {
      query.whereILike(this.config.searchable, `%${search}%`)
    }
  }

  applyFilter(query: DatabaseQueryBuilderContract<LucidModel>) {
    const { filter, filterValue } = this.ctx.request.all()

    for (let filterable in this.config.filterable) {
      if (filter === filterable) {
        query.where(filter, filterValue)
      }
    }
  }

  applySorting(query: DatabaseQueryBuilderContract<LucidModel>) {
    const { sort, order } = this.ctx.request.all()

    for (let sortable in this.config.sortable) {
      if (sortable === sort) {
        query.orderBy(sortable, order || 'desc')
      }
    }
  }
}
