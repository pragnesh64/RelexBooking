import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import type { Schema } from "../../amplify/data/resource";

type AmplifyClient = ReturnType<typeof generateClient<Schema>>;

let client: AmplifyClient | null = null;
let clientError: Error | null = null;

function isAmplifyConfigured(): boolean {
  try {
    const config = Amplify.getConfig();
    // Check if GraphQL API configuration exists in Amplify v6 format
    // The config should have a data property with GraphQL API configuration
    return !!(config?.API?.GraphQL || (config as any)?.data);
  } catch {
    return false;
  }
}

export function getAmplifyClient(): AmplifyClient | null {
  if (client || clientError) {
    return client;
  }

  // Check if Amplify is configured before attempting to generate client
  if (!isAmplifyConfigured()) {
    clientError = new Error(
      "Amplify is not configured. Please run 'npx ampx sandbox' to deploy your backend and generate amplify_outputs.json",
    );
    console.warn(
      "[Amplify] Failed to generate data client. Ensure Amplify.configure() is called with GraphQL provider configuration.",
      clientError,
    );
    return null;
  }

  try {
    client = generateClient<Schema>();
    // Test if client is actually usable by trying to access models property
    // This will throw if the client was generated but configuration is invalid
    // We use a getter that might throw, so we access it in a way that catches the error
    void client.models; // Access models to trigger any getter errors
  } catch (error) {
    clientError = error as Error;
    client = null;
    console.warn(
      "[Amplify] Failed to generate data client. Ensure Amplify.configure() is called with GraphQL provider configuration.",
      clientError,
    );
  }

  return client;
}

export function getAmplifyClientError() {
  return clientError;
}

// Export types from schema
export type Event = Schema["Event"]["type"];
export type Booking = Schema["Booking"]["type"];
export type UserProfile = Schema["UserProfile"]["type"];
