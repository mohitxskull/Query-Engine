import vine from '@vinejs/vine'
import { PageSchema, LimitSchema, OrderSchema } from '@folie/castle/validator'
import { handler, serializePage } from '@folie/castle/helpers'
import { BookTitleSchema } from '#validators/index'
import Book from '#models/book'

export default class Controller {
  input = vine.compile(
    vine.object({
      query: vine
        .object({
          page: PageSchema.optional(),
          limit: LimitSchema.optional(),

          order: OrderSchema('createdAt', 'updatedAt', 'title', 'id').optional(),

          filter: vine
            .object({
              value: BookTitleSchema.optional(),
            })
            .optional(),
        })
        .optional(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    // Start building the query to fetch tasks
    let listQuery = Book.query()

    // Filter by task title if provided
    if (payload.query?.filter?.value) {
      listQuery = listQuery.where('title', 'like', `%${payload.query.filter.value}%`)
    }

    // Execute the query and paginate results
    const list = await listQuery
      .orderBy(payload.query?.order?.by ?? 'createdAt', payload.query?.order?.dir ?? 'desc')
      .paginate(payload.query?.page ?? 1, payload.query?.limit ?? 10)

    return serializePage(list, (d) => d.$serialize())
  })
}
