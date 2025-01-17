import edge from 'edge.js'
import Datatable, { DatatableConfig } from '#providers/data_table/data_table'
import type { ApplicationService } from '@adonisjs/core/types'
import { DatabaseQueryBuilder } from '@adonisjs/lucid/database'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { LucidModel } from '@adonisjs/lucid/types/model'
import ExtendedPaginator from './extended_paginator.js'

/**
 * Declare datatable on the contract namespaces
 */
declare module '@adonisjs/lucid/types/querybuilder' {
  export interface ChainableContract {
    datatable: (
      queryString: Record<string, string>,
      config: DatatableConfig
    ) => Promise<ExtendedPaginator<LucidModel>>
  }
}

declare module '@adonisjs/lucid/database' {
  interface DatabaseQueryBuilder {
    datatable: (
      queryString: Record<string, string>,
      config: DatatableConfig
    ) => Promise<ExtendedPaginator<LucidModel>>
  }
}

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    datatable: (
      queryString: Record<string, string>,
      config: DatatableConfig
    ) => Promise<ExtendedPaginator<LucidModel>>
  }
}

/**
 * Apply the macros on boot
 */

export default class DatatableBuilderProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * The container bindings have booted
   */
  async boot() {
    edge.global('clamp', function (min: number, max: number, number: number) {
      return Math.max(min, Math.min(number, max))
    })

    DatabaseQueryBuilder.macro(
      'datatable',
      function (queryString: Record<string, string>, config: DatatableConfig) {
        // @ts-ignore
        const self = this as DatabaseQueryBuilder
        return new Datatable(() => self, config).apply(queryString)
      }
    )

    ModelQueryBuilder.macro(
      'datatable',
      function (queryString: Record<string, string>, config: DatatableConfig) {
        // @ts-ignore
        const self = this as ModelQueryBuilder
        return new Datatable(() => self, config).apply(queryString)
      }
    )
  }
}
