// Load env FIRST
import dotenv from 'dotenv';
dotenv.config();

import { notificationQueue } from '../config/notificationQueue';
import SMSModule from '../utils/smsModule';
import { Job } from 'bull';

async function processNotificationJob(job: Job) {
  const { receiver, templateType, data } = job.data;

  const success = await SMSModule.send(
    receiver,
    templateType,
    data,
    's'
  );

  if (success) {
    console.log(`✅ Notification sent → ${receiver}`);
  }
}

async function startWorker() {
  console.log('🔄 Queue worker starting...');

  // Ensure Redis is connected before processing
  await notificationQueue.isReady();
  console.log('✅ Redis connected');

  notificationQueue.process(
    Number(process.env.WORKER_CONCURRENCY || 5),
    processNotificationJob
  );

  notificationQueue.on('active', (job) => {
    console.log(`🔄 Processing job ${job.id}`);
  });

  notificationQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  notificationQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  notificationQueue.on('error', (err) => {
    console.error('❌ Queue error:', err);
  });
}

// Graceful shutdown
const shutdown = async () => {
  console.log('⏹️  Shutting down worker...');
  await notificationQueue.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start worker
startWorker().catch((err) => {
  console.error('💥 Worker startup failed:', err);
  process.exit(1);
});
