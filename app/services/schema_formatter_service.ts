import { DatabaseSchema, SchemaFormatter } from '#types/db_schema_types'

export class SchemaFormatterService implements SchemaFormatter {
  toJson(schema: DatabaseSchema, pretty: boolean = true): string {
    return JSON.stringify(schema, null, pretty ? 2 : undefined)
  }

  toText(schema: DatabaseSchema): string {
    const outputLines: string[] = []
    const tableNames = Object.keys(schema).sort() // Already sorted by inspector, but good practice here too

    if (tableNames.length === 0) {
      return 'Database schema is empty or no tables were found.'
    }

    tableNames.forEach((tableName, index) => {
      const tableSchema = schema[tableName]

      if (index > 0) {
        outputLines.push('') // Separator line
      }

      outputLines.push(`Table: ${tableName}`)

      // Columns
      outputLines.push(`  Columns:`)
      const columnNames = Object.keys(tableSchema.columns) // Assumes inspector sorted columns if needed (ordinal pos)
      if (columnNames.length > 0) {
        columnNames.forEach((columnName) => {
          const columnInfo = tableSchema.columns[columnName]
          let detailsString = `(nullable: ${columnInfo.nullable})`
          if (columnInfo.defaultValue !== null) {
            detailsString += ` (default: ${columnInfo.defaultValue})`
          }
          outputLines.push(`    ${columnName}: ${columnInfo.type} ${detailsString}`)
        })
      } else {
        outputLines.push(`    (No columns found)`)
      }

      // Primary Key (assumes inspector sorted composite keys)
      outputLines.push(
        `  Primary Key: ${tableSchema.primaryKey.length > 0 ? `(${tableSchema.primaryKey.join(', ')})` : '(None)'}`
      )

      // Foreign Keys (assumes inspector sorted FKs)
      outputLines.push(`  Foreign Keys:`)
      if (tableSchema.foreignKeys.length > 0) {
        tableSchema.foreignKeys.forEach((fk) => {
          outputLines.push(`    ${fk.column} -> ${fk.references}(${fk.onColumn})`)
        })
      } else {
        outputLines.push(`    (None)`)
      }
    })

    return outputLines.join('\n')
  }
}
