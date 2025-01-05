require('dotenv').config();
const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'consumer-app',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const topic = process.env.KAFKA_TOPIC || 'events';
const dlqTopic = process.env.KAFKA_DLQ_TOPIC || 'failed-events'; // Dead Letter Queue (DLQ) topic
const consumer = kafka.consumer({ groupId: 'consumer-group' });

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-service.default.svc:27017';
const dbName = process.env.MONGO_DB_NAME || 'test';
const collectionName = process.env.MONGO_COLLECTION || 'events';

const mongoClient = new MongoClient(mongoUri);

// Retry count
const maxRetries = 3;

async function consumeMessages() {
  try {

    const admin = kafka.admin();
    await admin.connect();
    await ensureDLQExists(admin, dlqTopic);
    await admin.disconnect();

    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    await consumer.connect();
    console.log('Consumer connected to Kafka');
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log('Received event:', JSON.stringify(event, null, 2));

        let retries = 0;
        let success = false;

        // Retry logic
        while (retries < maxRetries && !success) {
          try {
            // Attempt to store event in MongoDB
            await collection.insertOne(event);
            console.log('Event stored in MongoDB');
            success = true;
          } catch (err) {
            retries++;
            console.error(`Retry ${retries} failed:`, err);
            if (retries === maxRetries) {
              console.error('Max retries reached. Sending to DLQ...');
              // Send the failed message to the Dead Letter Queue (DLQ)
              await sendToDLQ(event, err);
            } else {
              // Delay before retrying
              await delay(1000 * retries); // Exponential backoff (1s, 2s, 3s)
            }
          }
        }
      },
    });
  } catch (err) {
    console.error('Error in consumer:', err);
  }
}

// Ensure DLQ topic exists, create if not
async function ensureDLQExists(admin, dlqTopic) {
  const topics = await admin.listTopics();
  if (!topics.includes(dlqTopic)) {
    console.log(`DLQ topic "${dlqTopic}" not found, creating it...`);
    await admin.createTopics({
      topics: [{
        topic: dlqTopic,
        numPartitions: 1,
        replicationFactor: 1,
      }],
    });
    console.log(`DLQ topic "${dlqTopic}" created.`);
  } else {
    console.log(`DLQ topic "${dlqTopic}" already exists.`);
  }
}

// Delay function for retry backoff
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Send failed messages to Dead Letter Queue
async function sendToDLQ(event, error) {
  const producer = kafka.producer();
  await producer.connect();

  try {
    await producer.send({
      topic: dlqTopic,
      messages: [
        {
          value: JSON.stringify({
            event,
            error: error.message,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log('Event sent to DLQ');
  } catch (err) {
    console.error('Error sending to DLQ:', err);
  } finally {
    await producer.disconnect();
  }
}

consumeMessages().catch(console.error);

process.on('SIGINT', async () => {
  console.log('Shutting down consumer...');
  await consumer.disconnect();
  await mongoClient.close();
  process.exit(0);
});
