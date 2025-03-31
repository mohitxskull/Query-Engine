import { squid } from '#config/squid'
import Book from '#models/book'
import { ProcessingException } from '@folie/castle/exception'
import { handler } from '@folie/castle/helpers'
import vine from '@vinejs/vine'

export default class Controller {
  input = vine.compile(
    vine.object({
      params: vine.object({
        bookId: squid.book.schema,
      }),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const book = await Book.find(payload.params.bookId)

    if (!book) {
      throw new ProcessingException('Book not found', {
        status: 'NOT_FOUND',
      })
    }

    return { book: book.$serialize() }
  })
}
