import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'
import ExtendedPaginator from './extended_paginator.js'

export type DatatableConfig = {
  defaultSortKey: string
  baseUrl: string
  pagination: { perPage: number }
  select: string[]
  searchable: string[]
  sortable: Record<string, string>
  filterable: Record<string, string>
}

type BuilderContracts =
  | DatabaseQueryBuilderContract<LucidModel>
  | ModelQueryBuilderContract<LucidModel>

export default class Datatable {
  private query: () => BuilderContracts
  private config: DatatableConfig

  constructor(query: () => BuilderContracts, config: DatatableConfig) {
    this.query = query
    this.config = config
  }

  async apply(queryString: Record<string, string>) {
    const query = this.query.call(this)

    this.applySelect(query, queryString)
    this.applySorting(query, queryString)
    this.applyFilter(query, queryString)
    this.applySearch(query, queryString)

    const paginator = await this.applyPaginate(query, queryString)

    const extended = new ExtendedPaginator(
      this.config,
      queryString,
      paginator.total,
      paginator.perPage,
      paginator.currentPage,
      ...paginator.all()
    )

    return extended
  }

  private applySelect(query: BuilderContracts, queryString: Record<string, string>) {
    const { columns } = queryString

    if (columns) {
      query.select(['id', columns])
    } else {
      query.select(...this.config.select)
    }
  }

  private async applyPaginate(query: BuilderContracts, queryString: Record<string, string>) {
    const { page, perPage } = queryString
    const paginator = await query.paginate(
      Number(page) || 1,
      Number(perPage) || this.config.pagination.perPage
    )

    return paginator
  }

  private applySearch(query: BuilderContracts, queryString: Record<string, string>) {
    const { search } = queryString

    if (search) {
      for (let searchable of this.config.searchable) {
        query.ifDialect(
          'better-sqlite3',
          (q) => q.orWhereLike(searchable, `%${search}%`),
          (q) => q.orWhereILike(searchable, `%${search}%`)
        )
      }
    }
  }

  private applyFilter(query: BuilderContracts, queryString: Record<string, string>) {
    const { filter, filterValue } = queryString

    for (let filterable in this.config.filterable) {
      if (filter === filterable) {
        query.where(filter, filterValue)
      }
    }
  }

  private applySorting(query: BuilderContracts, queryString: Record<string, string>) {
    const { sort, order } = queryString

    if (!sort) {
      query.orderBy(this.config.defaultSortKey || 'id', 'asc')
    }

    for (let sortable in this.config.sortable) {
      if (sortable === sort) {
        query.orderBy(sortable, (order as 'asc' | 'desc') || 'desc')
        break
      }
    }
  }
}
