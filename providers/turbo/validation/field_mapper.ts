import { FieldMapper as FieldMapperType, FieldMappingRule } from './types.js'

/**
 * FieldMapper class responsible for mapping validation field names to form input IDs
 *
 * This class handles various field name formats including nested fields, array fields,
 * and provides support for custom mapping rules.
 */
export class FieldMapper {
  /**
   * Default mapping rules applied in sequence
   * @private
   */
  private defaultRules: FieldMappingRule[] = [
    // Handle nested field names (e.g., "user.email" -> "user-email")
    { pattern: /\./g, replacement: '-' },

    // Handle array field names with bracket notation (e.g., "items[0].name" -> "items-0-name")
    { pattern: /\[(\d+)\]/g, replacement: '-$1' },

    // Handle array field names with dot notation (e.g., "items.0.name" -> "items-0-name")
    { pattern: /\.(\d+)\./g, replacement: '-$1-' },
    { pattern: /\.(\d+)$/g, replacement: '-$1' },

    // Handle complex nested arrays (e.g., "form.fields[0].options[1].value" -> "form-fields-0-options-1-value")
    { pattern: /\[(\w+)\]/g, replacement: '-$1' },

    // Clean up any double dashes that might have been created
    { pattern: /-+/g, replacement: '-' },

    // Remove leading/trailing dashes
    { pattern: /^-+|-+$/g, replacement: '' },
  ]

  /**
   * Custom mapping rules that will be applied after default rules
   * @private
   */
  private customRules: FieldMappingRule[] = []

  /**
   * Custom field mapper function that will be applied after all rules
   * @private
   */
  private customMapper: FieldMapperType | null = null

  /**
   * Create a new FieldMapper instance
   *
   * @param options Optional configuration options
   */
  constructor(options?: { customRules?: FieldMappingRule[]; customMapper?: FieldMapperType }) {
    if (options?.customRules) {
      this.customRules = options.customRules
    }

    if (options?.customMapper) {
      this.customMapper = options.customMapper
    }
  }

  /**
   * Map a validation field name to a form input element ID
   *
   * @param fieldName The field name to map
   * @returns The mapped input ID
   */
  mapFieldToInputId(fieldName: string): string {
    // First handle nested fields and array notation
    let inputId = this.handleNestedFields(fieldName)

    // Then handle array fields
    inputId = this.handleArrayFields(inputId)

    // Apply custom rules
    inputId = this.applyCustomRules(inputId)

    // Clean up the field name
    inputId = this.cleanupFieldName(inputId)

    // Apply custom mapper if provided
    if (this.customMapper) {
      inputId = this.customMapper(inputId)
    }

    return inputId
  }

  /**
   * Set a custom field mapper function
   *
   * @param mapper The custom field mapper function
   * @returns This FieldMapper instance for method chaining
   */
  setCustomMapper(mapper: FieldMapperType): this {
    this.customMapper = mapper
    return this
  }

  /**
   * Add a custom mapping rule
   *
   * @param rule The custom mapping rule to add
   * @returns This FieldMapper instance for method chaining
   */
  addCustomRule(rule: FieldMappingRule): this {
    this.customRules.push(rule)
    return this
  }

  /**
   * Add multiple custom mapping rules
   *
   * @param rules The custom mapping rules to add
   * @returns This FieldMapper instance for method chaining
   */
  addCustomRules(rules: FieldMappingRule[]): this {
    this.customRules.push(...rules)
    return this
  }

  /**
   * Clear all custom mapping rules
   *
   * @returns This FieldMapper instance for method chaining
   */
  clearCustomRules(): this {
    this.customRules = []
    return this
  }

  /**
   * Handle nested field names (e.g., "user.email" -> "user-email")
   *
   * @param fieldName The field name to process
   * @returns The processed field name
   * @private
   */
  private handleNestedFields(fieldName: string): string {
    // Replace dots with dashes to handle nested fields
    return fieldName.replace(/\./g, '-')
  }

  /**
   * Handle array field names with various notations
   *
   * @param fieldName The field name to process
   * @returns The processed field name
   * @private
   */
  private handleArrayFields(fieldName: string): string {
    // Handle array field names with bracket notation (e.g., "items[0].name" -> "items-0-name")
    let result = fieldName.replace(/\[(\d+)\]/g, '-$1')

    // Handle array field names with dot notation (e.g., "items.0.name" -> "items-0-name")
    result = result.replace(/\.(\d+)\./g, '-$1-')
    result = result.replace(/\.(\d+)$/g, '-$1')

    // Handle complex nested arrays (e.g., "form.fields[0].options[1].value" -> "form-fields-0-options-1-value")
    result = result.replace(/\[(\w+)\]/g, '-$1')

    return result
  }

  /**
   * Apply all custom rules to the field name
   *
   * @param fieldName The field name to process
   * @returns The processed field name
   * @private
   */
  private applyCustomRules(fieldName: string): string {
    let result = fieldName

    // Apply each custom rule in sequence
    for (const rule of this.customRules) {
      result = result.replace(rule.pattern, rule.replacement)
    }

    return result
  }

  /**
   * Clean up the field name by removing duplicate dashes and leading/trailing dashes
   *
   * @param fieldName The field name to clean up
   * @returns The cleaned up field name
   * @private
   */
  private cleanupFieldName(fieldName: string): string {
    // Clean up any double dashes that might have been created
    let result = fieldName.replace(/-+/g, '-')

    // Remove leading/trailing dashes
    result = result.replace(/^-+|-+$/g, '')

    return result
  }

  /**
   * Apply all default rules to the field name
   *
   * @param fieldName The field name to process
   * @returns The processed field name
   * @private
   */
  private applyDefaultRules(fieldName: string): string {
    let result = fieldName

    // Apply each default rule in sequence
    for (const rule of this.defaultRules) {
      result = result.replace(rule.pattern, rule.replacement)
    }

    return result
  }
}
