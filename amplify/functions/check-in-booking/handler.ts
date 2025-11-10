/**
 * Atomic Check-in Lambda Function
 *
 * This Lambda provides a race-condition-safe check-in operation using
 * DynamoDB's conditional expressions to ensure tickets can ONLY be
 * checked in once, even with simultaneous scanning.
 *
 * CRITICAL: Uses DynamoDB conditional update with attribute_not_exists
 * to prevent duplicate check-ins at the database level.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface CheckInEvent {
  bookingId: string;
  checkedInBy: string;
  checkedInByName: string;
  eventId?: string; // Optional: validate event ID
}

interface CheckInResponse {
  success: boolean;
  message: string;
  booking?: {
    id: string;
    checkedIn: boolean;
    checkedInAt: string;
    checkedInBy: string;
    checkedInByName: string;
  };
  error?: string;
}

export const handler = async (event: any): Promise<CheckInResponse> => {
  console.log('Check-in Lambda invoked:', JSON.stringify(event, null, 2));

  try {
    const body: CheckInEvent = typeof event.body === 'string' ? JSON.parse(event.body) : event;

    // Validate input
    if (!body.bookingId || !body.checkedInBy || !body.checkedInByName) {
      return {
        success: false,
        message: 'Missing required fields',
        error: 'bookingId, checkedInBy, and checkedInByName are required',
      };
    }

    const tableName = process.env.BOOKING_TABLE_NAME;
    if (!tableName) {
      throw new Error('BOOKING_TABLE_NAME environment variable not set');
    }

    const now = new Date().toISOString();

    // CRITICAL: Use DynamoDB conditional expression
    // This update will ONLY succeed if checkedIn is false (or doesn't exist)
    // If checkedIn is already true, the update will fail with ConditionalCheckFailedException
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        id: body.bookingId,
      },
      UpdateExpression:
        'SET checkedIn = :true, checkedInAt = :now, checkedInBy = :by, checkedInByName = :byName, #status = :status, updatedAt = :now',
      ConditionExpression: 'attribute_not_exists(checkedIn) OR checkedIn = :false',
      ExpressionAttributeNames: {
        '#status': 'status', // status is a reserved word
      },
      ExpressionAttributeValues: {
        ':true': true,
        ':false': false,
        ':now': now,
        ':by': body.checkedInBy,
        ':byName': body.checkedInByName,
        ':status': 'checked_in',
      },
      ReturnValues: 'ALL_NEW',
    });

    console.log('[SECURITY] Attempting atomic check-in with conditional expression...');

    try {
      const result = await docClient.send(command);

      console.log('[SECURITY] Check-in successful:', result.Attributes);

      return {
        success: true,
        message: 'Check-in successful',
        booking: {
          id: result.Attributes?.id as string,
          checkedIn: result.Attributes?.checkedIn as boolean,
          checkedInAt: result.Attributes?.checkedInAt as string,
          checkedInBy: result.Attributes?.checkedInBy as string,
          checkedInByName: result.Attributes?.checkedInByName as string,
        },
      };
    } catch (error: any) {
      // ConditionalCheckFailedException means checkedIn was already true
      if (error.name === 'ConditionalCheckFailedException') {
        console.warn('[SECURITY] Check-in BLOCKED - ticket already used');

        return {
          success: false,
          message: 'Already checked in - ticket has been used',
          error: 'ALREADY_CHECKED_IN',
        };
      }

      // Other errors (item not found, permission denied, etc.)
      throw error;
    }
  } catch (error: any) {
    console.error('[ERROR] Check-in failed:', error);

    return {
      success: false,
      message: 'Check-in failed',
      error: error.message || 'Unknown error',
    };
  }
};
