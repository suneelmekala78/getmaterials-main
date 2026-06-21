import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { connectDB, User } from "@getmaterials/database";

const expo = new Expo();

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

/**
 * Send push notification to a specific user (all their registered devices)
 */
export async function sendPushToUser(
  userId: string,
  notification: NotificationPayload
): Promise<void> {
  await connectDB();
  const user = await User.findById(userId).select("pushDevices").lean();

  if (!user?.pushDevices?.length) return;

  const tokens = user.pushDevices.map((d: any) => d.pushToken);
  await sendPushToTokens(tokens, notification);
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  notification: NotificationPayload
): Promise<void> {
  await connectDB();
  const users = await User.find({ _id: { $in: userIds } })
    .select("pushDevices")
    .lean();

  const tokens = users.flatMap(
    (u: any) => u.pushDevices?.map((d: any) => d.pushToken) || []
  );

  if (!tokens.length) return;
  await sendPushToTokens(tokens, notification);
}

/**
 * Send push notification to all users with a specific role
 */
export async function sendPushToRole(
  role: string,
  notification: NotificationPayload
): Promise<void> {
  await connectDB();
  const users = await User.find({
    role,
    status: "active",
    "pushDevices.0": { $exists: true },
  })
    .select("pushDevices")
    .lean();

  const tokens = users.flatMap(
    (u: any) => u.pushDevices?.map((d: any) => d.pushToken) || []
  );

  if (!tokens.length) return;
  await sendPushToTokens(tokens, notification);
}

/**
 * Send push notification to specific Expo push tokens
 */
async function sendPushToTokens(
  pushTokens: string[],
  notification: NotificationPayload
): Promise<void> {
  // Filter valid Expo push tokens
  const validTokens = pushTokens.filter((token) =>
    Expo.isExpoPushToken(token)
  );

  if (!validTokens.length) return;

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
    channelId: notification.channelId || "default",
  }));

  // Chunk messages (Expo recommends batches of ~100)
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending push notification chunk:", error);
    }
  }

  // Handle invalid tokens (remove from DB)
  await handleInvalidTokens(pushTokens, tickets);
}

/**
 * Remove invalid/expired tokens from the database
 */
async function handleInvalidTokens(
  tokens: string[],
  tickets: ExpoPushTicket[]
): Promise<void> {
  const invalidTokens: string[] = [];

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    if (
      ticket.status === "error" &&
      ticket.details?.error === "DeviceNotRegistered"
    ) {
      invalidTokens.push(tokens[i]);
    }
  }

  if (invalidTokens.length > 0) {
    await connectDB();
    await User.updateMany(
      { "pushDevices.pushToken": { $in: invalidTokens } },
      { $pull: { pushDevices: { pushToken: { $in: invalidTokens } } } }
    );
  }
}
