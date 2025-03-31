import vine from '@vinejs/vine'
import { handler } from '@folie/castle/helpers'
import { AIQueryService } from '#services/ai_query_service'

export default class Controller {
  input = vine.compile(
    vine.object({
      q: vine.string(),
    })
  )

  handle = handler(async ({ ctx }) => {
    const payload = await ctx.request.validateUsing(this.input)

    const aiQueryService = new AIQueryService()

    // Todo: Move to another file to avoid initialization on every request
    await aiQueryService.init()

    const res = await aiQueryService.query(payload.q)

    return res
  })
}
