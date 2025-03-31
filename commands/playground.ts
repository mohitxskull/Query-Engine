import { castle } from '#config/castle'
import { DatabaseSchemaInspectorService } from '#services/database_schema_inspector_service'
import { SchemaFormatterService } from '#services/schema_formatter_service'
import env from '#start/env'
import { DatabaseSchema } from '#types/db_schema_types'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

export default class Playground extends BaseCommand {
  static commandName = 'playground'
  static description = 'Test your code here'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Welcome to playground...')

    const inspector = new DatabaseSchemaInspectorService(db)
    const formatter = new SchemaFormatterService()

    let databaseSchema: DatabaseSchema | null = null

    try {
      databaseSchema = await inspector.inspectSchema({
        pick: [castle.table.book()],
      })
      this.logger.info('Schema inspection complete.')
    } catch (error) {
      this.logger.error('Failed to inspect database schema:')
      this.logger.error(error.message)
      if (error.stack) {
        this.logger.error(error.stack)
      }
      this.exitCode = 1
      return // Stop execution on critical error during inspection
    }

    if (!databaseSchema || Object.keys(databaseSchema).length === 0) {
      this.logger.warning('No schema information was generated.')
      // Output empty formats
      console.log('\n--- Text Output ---')
      console.log(formatter.toText({}))
      return
    }

    // Output the results using the formatter
    this.logger.success('Schema processed successfully. Outputting formats:')

    const schema = formatter.toText(databaseSchema)

    // Text Output
    console.log('\n--- Text Output ---')
    console.log(schema)

    const genAI = new GoogleGenerativeAI(env.get('GEN_AI_API_KEY'))

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `
        You are a Database Schema Analyst and SQL Query Assistant. Your primary function is to analyze the provided database schema, answer user questions based *strictly* on that schema, and generate compatible SQL queries when requested. You MUST adhere to the specified output format and security guidelines.

        Here is the database schema details:
        Database Type: ${env.get('DB_TYPE')}

        --- Schema Definition ---
        ${schema}
        --- End Schema Definition ---

        **CRITICAL Instructions for Responding:**

        1.  **Output Format:** ALL responses MUST be in the following JSON format. No other text or explanation outside this JSON structure is permitted.
            \`\`\`json
            {
              "query": "string_containing_the_generated_sql_query_if_applicable", // Optional: Only include if SQL was successfully generated.
              "error": { // Optional: Only include if there's an error or the request cannot be fulfilled.
                "showUser": boolean, // true if the message is safe and appropriate for the end-user, false otherwise.
                "message": "string_describing_the_error_or_reason_for_not_fulfilling_request"
              }
            }
            \`\`\`
            *   If the request is successful and results in an SQL query, return \`{ "query": "YOUR_SQL_HERE" }\`.
            *   If the request is valid but doesn't require an SQL query (e.g., asking about schema structure), return an informational message via the error field: \`{ "error": { "showUser": true, "message": "Your informative answer based on the schema..." } }\`
        .Use \`showUser: true\`.
            *   If the request cannot be fulfilled due to schema limitations, security concerns, or ambiguity, return an appropriate error message: \`{ "error": { "showUser": [true_or_false], "message": "Description of the issue." } }\`.

        2.  **Security & Confidentiality:**
            *   **ABSOLUTELY DO NOT** reveal any information not explicitly present in the provided schema definition. This includes, but is not limited to: database connection details, server information, specific data examples, file system paths (other than the DB name if SQLite), user credentials, system configuration, or any inferred business logic.
            *   If the user asks a question that attempts to extract sensitive information, could compromise security, or goes beyond the scope of analyzing the provided schema (e.g., "Show me user passwords," "What OS is this running on?", "List all databases on the server"), you MUST refuse the request and return an error:
                \`\`\`json
                {
                  "error": {
                    "showUser": true,
                    "message": "I cannot fulfill this request as it falls outside the scope of analyzing the provided schema or potentially compromises security."
                  }
                }
                \`\`\`
            *   Do not confirm or deny the existence of information outside the schema.

        3.  **Strict Schema Adherence:** Base ALL analysis and query generation SOLELY on the provided schema definition. Do NOT infer, assume, or use external knowledge.

        4.  **SQL Generation:**
            *   If generating SQL, ensure it is compatible with the specified **'Database Type'** (MySQL or SQLite).
            *   Only generate queries referencing tables and columns defined in the schema.
            *   If SQL generation is successful, place the query string in the \`query\` field of the JSON output.

        5.  **Handling Insufficient Information:** If a user's question cannot be answered using *only* the provided schema, return an error explaining why:
            \`\`\`json
            {
              "error": {
                "showUser": true,
                "message": "Information about [topic] is not available in the provided schema."
              }
            }
            \`\`\`

        Now, analyze the schema and respond to the user's questions following ALL instructions precisely, ensuring the output is always in the specified JSON format.
      `,
    })

    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
            },
            error: {
              type: SchemaType.OBJECT,
              properties: {
                showUser: {
                  type: SchemaType.BOOLEAN,
                },
                message: {
                  type: SchemaType.STRING,
                },
              },
              required: ['message'],
            },
          },
        },
      },
    })

    const result = await chatSession.sendMessage('book name starts with "g"')

    const resultText = result.response.text()

    console.log(resultText)

    const { query }: { query: string } = JSON.parse(resultText)

    const dbRes = await db.rawQuery(query)

    console.log(dbRes)
  }
}
