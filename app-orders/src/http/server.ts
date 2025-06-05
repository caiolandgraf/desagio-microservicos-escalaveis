import { fastify } from 'fastify'
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
  return 'OK'
})

app.post(
  '/orders',
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (req, rep) => {
    const { amount } = req.body

    console.log('Creating an order with amount:', amount)

    const orderId = crypto.randomUUID()

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: '7919cd6f-1e24-47d2-9cec-fd0ad7d4f05e',
      },
    })

    await db.insert(schema.orders).values({
      id: crypto.randomUUID(),
      customerId: '7919cd6f-1e24-47d2-9cec-fd0ad7d4f05e',
      amount,
    })

    return rep.status(201).send()
  }
)

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => {
    console.log('[Orders] HTTP Server running!')
  })
