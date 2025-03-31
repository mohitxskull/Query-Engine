import db from '@adonisjs/lucid/services/db'
import type {
  DatabaseSchema,
  TableSchema,
  DatabaseSchemaInspector,
} from '../../types/db_schema_types.js' // Use .js for module resolution
import { inject } from '@adonisjs/core'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import stringHelpers from '@adonisjs/core/helpers/string'

// Define more specific types for raw query results if possible
type SqliteTableInfo = {
  cid: number
  name: string
  type: string
  notnull: 0 | 1
  dflt_value: string | null
  pk: 0 | 1
}

type SqliteFkInfo = {
  id: number
  seq: number
  table: string
  from: string
  to: string
  on_update: string
  on_delete: string
  match: string
}

type MysqlColumnInfo = {
  COLUMN_NAME: string
  COLUMN_TYPE: string
  IS_NULLABLE: 'YES' | 'NO'
  COLUMN_DEFAULT: string | null
  COLUMN_KEY: 'PRI' | 'MUL' | 'UNI' | ''
  EXTRA: string
}

type MysqlFkInfo = {
  COLUMN_NAME: string
  REFERENCED_TABLE_NAME: string
  REFERENCED_COLUMN_NAME: string
}

@inject()
export class DatabaseSchemaInspectorService implements DatabaseSchemaInspector {
  protected logger = logger.child({
    service: 'Database Schema Inspector',
  })

  // Inject the Lucid Database service instance
  constructor(protected database: typeof db) {}

  /**
   * Normalizes the default value returned by the database.
   */
  private normalizeDefaultValue(defaultValue: any): string | null {
    if (defaultValue === null || defaultValue === undefined) {
      return null
    }
    // Knex sometimes returns Buffer for defaults, convert if necessary
    const valueStr = Buffer.isBuffer(defaultValue) ? defaultValue.toString() : String(defaultValue)

    const upperValueStr = valueStr.toUpperCase()

    if (upperValueStr === 'NULL') {
      return null
    }
    // Handle CURRENT_TIMESTAMP variations (case-insensitive)
    if (upperValueStr.includes('CURRENT_TIMESTAMP')) {
      return 'CURRENT_TIMESTAMP' // Normalize
    }
    // Remove potential surrounding quotes for string defaults
    if (
      (valueStr.startsWith("'") && valueStr.endsWith("'")) ||
      (valueStr.startsWith('"') && valueStr.endsWith('"'))
    ) {
      return valueStr.slice(1, -1)
    }
    // Handle 'b'BINARY'' format from mysql
    if (valueStr.startsWith("b'") && valueStr.endsWith("'")) {
      return valueStr.slice(2, -1)
    }

    return valueStr
  }

  /**
   * Fetches the list of table names for the current connection.
   */
  private async getTableNames(dbType: string): Promise<string[]> {
    let tables: string[] = []

    if (dbType === 'sqlite') {
      const result = await this.database.rawQuery<{ name: string }[]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
      )
      tables = result.map((t) => t.name)
    } else if (dbType === 'mysql') {
      try {
        // Use information_schema (preferred)
        const result = await this.database.rawQuery<[{ table_name: string }[]]>(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY table_name"
        )
        tables = result[0].map((t) => t.table_name)
      } catch (infoSchemaError) {
        this.logger.warn(
          { message: infoSchemaError.message },
          "Could not query information_schema, falling back to 'SHOW TABLES'."
        )
        // Fallback to SHOW TABLES
        const result = await this.database.rawQuery<[{ [key: string]: string }[]]>('SHOW TABLES')
        if (result[0] && result[0][0]) {
          const key = Object.keys(result[0][0])[0]
          tables = result[0].map((t) => t[key]).sort() // Sort here too
        } else {
          this.logger.warn('SHOW TABLES returned no results or unexpected format.')
          tables = []
        }
      }
    } else {
      throw new Error(`Unsupported database client for inspection: ${dbType}`)
    }

    return tables.filter((name) => !name.startsWith('adonis')) // Exclude migrations table
  }

  /**
   * Fetches detailed schema information for a specific SQLite table.
   */
  private async getSqliteTableSchema(tableName: string): Promise<TableSchema> {
    const tableSchema: TableSchema = { columns: {}, primaryKey: [], foreignKeys: [] }

    // Get Columns and Primary Key
    const columnsInfo = await this.database.rawQuery<SqliteTableInfo[]>(
      `PRAGMA table_info(${tableName});`
    )

    for (const col of columnsInfo) {
      tableSchema.columns[col.name] = {
        type: col.type.toLowerCase(),
        nullable: col.notnull === 0,
        defaultValue: this.normalizeDefaultValue(col.dflt_value),
      }
      if (col.pk === 1) {
        tableSchema.primaryKey.push(col.name)
      }
    }
    // Sort PK if composite
    if (tableSchema.primaryKey.length > 1) tableSchema.primaryKey.sort()

    // Get Foreign Keys
    const fkInfo = await this.database.rawQuery<SqliteFkInfo[]>(
      `PRAGMA foreign_key_list(${tableName});`
    )
    tableSchema.foreignKeys = fkInfo
      .map((fk) => ({
        column: fk.from,
        references: fk.table,
        onColumn: fk.to,
      }))
      .sort((a, b) => a.column.localeCompare(b.column)) // Sort FKs

    return tableSchema
  }

  /**
   * Fetches detailed schema information for a specific MySQL table.
   */
  private async getMysqlTableSchema(tableName: string): Promise<TableSchema> {
    const tableSchema: TableSchema = { columns: {}, primaryKey: [], foreignKeys: [] }

    // Get Columns and Primary Key info
    const columnsInfo = await this.database.rawQuery<[MysqlColumnInfo[]]>(
      `SELECT
        COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION;`,
      [tableName]
    )

    for (const col of columnsInfo[0]) {
      tableSchema.columns[col.COLUMN_NAME] = {
        type: col.COLUMN_TYPE.toLowerCase(),
        nullable: col.IS_NULLABLE === 'YES',
        defaultValue: this.normalizeDefaultValue(col.COLUMN_DEFAULT),
      }
      if (col.COLUMN_KEY === 'PRI') {
        tableSchema.primaryKey.push(col.COLUMN_NAME)
      }
    }
    // Sort PK if composite
    if (tableSchema.primaryKey.length > 1) tableSchema.primaryKey.sort()

    // Get Foreign Key info
    const fkInfo = await this.database.rawQuery<[MysqlFkInfo[]]>(
      `SELECT
                COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
              FROM information_schema.KEY_COLUMN_USAGE
              WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = ?
                AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      [tableName]
    )

    tableSchema.foreignKeys = fkInfo[0]
      .map((fk) => ({
        column: fk.COLUMN_NAME,
        references: fk.REFERENCED_TABLE_NAME,
        onColumn: fk.REFERENCED_COLUMN_NAME,
      }))
      .sort((a, b) => a.column.localeCompare(b.column)) // Sort FKs

    return tableSchema
  }

  /**
   * Inspects the database connected via the db service and returns its schema.
   */
  async inspectSchema(options?: { omit?: string[]; pick?: string[] }): Promise<DatabaseSchema> {
    const dbType = env.get('DB_TYPE')

    const databaseSchema: DatabaseSchema = {}

    const tables = await this.getTableNames(dbType).then((t) => {
      // Pick has higher precedence than omit
      if (options?.pick) {
        return t.filter((tt) => options.pick?.includes(tt))
      }

      if (options?.omit) {
        return t.filter((tt) => !options.omit?.includes(tt))
      }

      return t
    })

    if (tables.length === 0) {
      this.logger.warn('No tables found to inspect (excluding migrations table).')
      return {}
    }

    this.logger.info(`Inspecting tables: ${stringHelpers.sentence(tables)}...`) // Simple progress

    for (const tableName of tables) {
      try {
        this.logger.info(`Processing ${tableName}`) // More granular progress
        if (dbType === 'sqlite') {
          databaseSchema[tableName] = await this.getSqliteTableSchema(tableName)
        } else if (dbType === 'mysql') {
          databaseSchema[tableName] = await this.getMysqlTableSchema(tableName)
        }
      } catch (error) {
        this.logger.error({ err: error }, `Error processing table ${tableName}:`)
        // Decide whether to continue or re-throw
        throw error
      }
    }

    return databaseSchema
  }
}
