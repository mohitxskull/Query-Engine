/**
 * Information about a single database column.
 */
export interface ColumnInfo {
  type: string
  nullable: boolean
  defaultValue: string | null
  // Add more properties as needed (e.g., isPrimary, isUnique, autoIncrement)
}

/**
 * Information about a foreign key constraint.
 */
export interface ForeignKeyInfo {
  column: string // The column name in the current table
  references: string // The table name it references
  onColumn: string // The column name in the referenced table
}

/**
 * Represents the schema of a single database table.
 */
export interface TableSchema {
  columns: Record<string, ColumnInfo>
  primaryKey: string[]
  foreignKeys: ForeignKeyInfo[]
}

/**
 * Represents the entire database schema, mapping table names to their schemas.
 */
export interface DatabaseSchema {
  [tableName: string]: TableSchema
}

/**
 * Interface for a database schema inspector.
 */
export interface DatabaseSchemaInspector {
  inspectSchema(): Promise<DatabaseSchema>
}

/**
 * Interface for a schema formatter.
 */
export interface SchemaFormatter {
  toJson(schema: DatabaseSchema): string
  toText(schema: DatabaseSchema): string
}
