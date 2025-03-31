import vine from '@vinejs/vine'

export const BookListSchema = vine.object({
  numFound: vine.number(),
  docs: vine.array(
    vine.object({
      author_name: vine.array(vine.string()),
      title: vine.string(),
      author_key: vine.array(vine.string()),
      lending_edition_s: vine.string().optional(),
    })
  ),
})
