import amqp from 'amqplib'

if (!process.env.BROKER_URL) {
  throw new Error('BROKER_URL environment variable is not set')
}

export const broker = await amqp.connect(process.env.BROKER_URL)
