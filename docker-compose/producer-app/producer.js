require('dotenv').config();
const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'producer-app',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'events';

async function sendMessage() {
  try {
    const payload = {
      eventId: uuidv4(),
      eventType: Math.random() > 0.5 ? 'user_signup' : 'order_created',
      timestamp: new Date().toISOString(),
      payload: {
        randomValue: Math.random().toString(36).substring(7),
      },
    };

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });

    console.log('Published event:', JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('Error publishing message:', err);
  }
}

async function run() {
  await producer.connect();
  console.log('Producer connected to Kafka');
  setInterval(sendMessage, 3000);
}

run().catch(console.error);

process.on('SIGINT', async () => {
  console.log('Shutting down producer...');
  await producer.disconnect();
  process.exit(0);
});
