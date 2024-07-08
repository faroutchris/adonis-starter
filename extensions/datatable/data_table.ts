import { HttpContext } from '@adonisjs/core/http'
import { LucidModel } from '@adonisjs/lucid/types/model'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

export type DatatableConfig = {
  baseUrl: string
  pagination: { perPage: number }
  select: string[]
  searchable: string[]
  sortable: Record<string, string>
  filterable: Record<string, string>
}

export default class Datatable {
  private query: () => DatabaseQueryBuilderContract<LucidModel>
  private config: DatatableConfig

  constructor(query: () => DatabaseQueryBuilderContract<LucidModel>, config: DatatableConfig) {
    this.query = query
    this.config = config
  }

  async create(ctx: HttpContext) {
    const { page, perPage } = ctx.request.all()

    const query = this.query.call(this).select(...this.config.select)

    this.applySorting(query, ctx)
    this.applyFilter(query, ctx)
    this.applySearch(query, ctx)

    const q = await query.paginate(
      Number(page) || 1,
      Number(perPage) || this.config.pagination.perPage
    )

    return q.baseUrl(this.config.baseUrl).queryString(ctx.request.all())
  }

  private applySearch(query: DatabaseQueryBuilderContract<LucidModel>, ctx: HttpContext) {
    const { search } = ctx.request.all()
    if (search) {
      for (let searchable of this.config.searchable) {
        query.orWhereILike(searchable, `%${search}%`)
      }
    }
  }

  private applyFilter(query: DatabaseQueryBuilderContract<LucidModel>, ctx: HttpContext) {
    const { filter, filterValue } = ctx.request.all()

    for (let filterable in this.config.filterable) {
      if (filter === filterable) {
        query.where(filter, filterValue)
      }
    }
  }

  private applySorting(query: DatabaseQueryBuilderContract<LucidModel>, ctx: HttpContext) {
    const { sort, order } = ctx.request.all()

    for (let sortable in this.config.sortable) {
      if (sortable === sort) {
        query.orderBy(sortable, order || 'desc')
      }
    }
  }
}
