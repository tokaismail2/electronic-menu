import { addNotificationToQueue as addToRedisQueue } from '../config/notificationQueue';

/**
 * Utility to add notifications to the Redis queue
 * @param phoneNumber - Phone number to send notification to
 * @param message - Message text to send
 */
export async function addNotificationToQueue(phoneNumber: string, templateType: string, data: any, channel: string): Promise<void> {
  return await addToRedisQueue(phoneNumber, templateType, data, channel);
}

  