import db from '@adonisjs/lucid/services/db'
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

  async apply(queryString: Record<string, string>) {
    const query = this.query.call(this).select(...this.config.select)
    const columns = await this.getAllColumns()
    console.log(columns)
    this.applySorting(query, queryString)
    this.applyFilter(query, queryString)
    this.applySearch(query, queryString)
    return this.applyPaginate(query, queryString)
  }

  private async getAllColumns() {
    return db.rawQuery(
      "SELECT json_object_keys(to_json(json_populate_record(NULL::employees, '{}'::JSON)))"
    )
  }

  private async applyPaginate(
    query: DatabaseQueryBuilderContract<LucidModel>,
    queryString: Record<string, string>
  ) {
    const { page, perPage } = queryString
    const q = await query.paginate(
      Number(page) || 1,
      Number(perPage) || this.config.pagination.perPage
    )

    return q.baseUrl(this.config.baseUrl).queryString(queryString)
  }

  private applySearch(
    query: DatabaseQueryBuilderContract<LucidModel>,
    queryString: Record<string, string>
  ) {
    const { search } = queryString

    if (search) {
      for (let searchable of this.config.searchable) {
        query.orWhereILike(searchable, `%${search}%`)
      }
    }
  }

  private applyFilter(
    query: DatabaseQueryBuilderContract<LucidModel>,
    queryString: Record<string, string>
  ) {
    const { filter, filterValue } = queryString

    for (let filterable in this.config.filterable) {
      if (filter === filterable) {
        query.where(filter, filterValue)
      }
    }
  }

  private applySorting(
    query: DatabaseQueryBuilderContract<LucidModel>,
    queryString: Record<string, string>
  ) {
    const { sort, order } = queryString

    for (let sortable in this.config.sortable) {
      if (sortable === sort) {
        query.orderBy(sortable, (order as 'asc' | 'desc') || 'desc')
      }
    }
  }
}
