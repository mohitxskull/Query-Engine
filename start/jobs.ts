import Book from '#models/book'
import { BookListSchema } from '#validators/cron'
import cache from '@adonisjs/cache/services/main'
import stringHelpers from '@adonisjs/core/helpers/string'
import logger from '@adonisjs/core/services/logger'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'
import { CronJob } from 'cron'
import ky, { TimeoutError } from 'ky'

CronJob.from({
  cronTime: '*/5 * * * *', // every 5 minute
  onTick: async () => {
    logger.info('Getting books...')

    const key = `book-list-page`
    const dbCache = cache.use('default')

    const pageToFetch = await dbCache.getOrSetForever({
      key,
      factory: async () => {
        return 1
      },
    })

    try {
      const bookListRaw = await ky
        .get<
          Infer<typeof BookListSchema>
        >(`https://openlibrary.org/search.json?q=g&limit=20&page=${pageToFetch}`)
        .json()

      const validatedBookList = await vine.validate({
        schema: BookListSchema,
        data: bookListRaw,
      })

      logger.info(
        { page: pageToFetch, books: validatedBookList.docs.map((b) => b.title) },
        'Books fetched'
      )

      if (validatedBookList.docs.length === 0) {
        await dbCache.setForever({ key, value: 1 })

        logger.info('No books found, starting again from first page')
      } else {
        await Book.updateOrCreateMany(
          'uuid',
          validatedBookList.docs.map((b) => ({
            uuid: b.lending_edition_s ?? stringHelpers.random(10),
            title: b.title,
            author: b.author_name[0],
            authorUuid: b.author_key[0],
          }))
        )

        await dbCache.setForever({ key, value: pageToFetch + 1 })

        logger.info('Library updated')
      }
    } catch (error) {
      logger.error({ page: pageToFetch, err: error }, 'Error updating library')

      if (error instanceof TimeoutError) {
        logger.warn('Request timed out')
      } else {
        await dbCache.setForever({ key, value: pageToFetch + 1 })
      }
    }
  },
  runOnInit: true,
  waitForCompletion: true,
  start: true,
})
