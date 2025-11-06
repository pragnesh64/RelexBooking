import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * API Client with automatic Amplify token attachment
 *
 * This provides a fetch wrapper that automatically:
 * - Attaches current Cognito access token as Bearer token
 * - Handles token refresh via Amplify (fetchAuthSession does this)
 * - Provides consistent error handling
 *
 * Usage:
 * ```ts
 * import { apiClient } from '@/lib/apiClient';
 *
 * // GET request
 * const data = await apiClient.get('/api/events');
 *
 * // POST request
 * const result = await apiClient.post('/api/bookings', { eventId: '123' });
 * ```
 *
 * Security notes:
 * - Tokens managed by Amplify (secure storage)
 * - Access tokens short-lived (1 hour default)
 * - Refresh handled automatically by fetchAuthSession
 * - Always use HTTPS in production
 */

interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
  method?: string;
}

async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, body, method = 'GET' } = options;

  // Get current access token (handles refresh automatically)
  let token: string | null = null;
  try {
    const session = await fetchAuthSession();
    token = session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    console.warn('Failed to get access token:', error);
    // Continue without token - API will return 401 if required
  }

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Attach Bearer token if available
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Build request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Send cookies if using cookie-based sessions
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    config.body = JSON.stringify(body);
  }

  // Make request
  const response = await fetch(url, config);

  // Handle non-OK responses
  if (!response.ok) {
    const error: any = new Error(`API error: ${response.statusText}`);
    error.status = response.status;
    error.statusText = response.statusText;

    // Try to parse error body
    try {
      error.body = await response.json();
    } catch {
      error.body = await response.text();
    }

    throw error;
  }

  // Parse response
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text() as any;
}

export const apiClient = {
  get: <T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, body, method: 'POST' }),

  put: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, body, method: 'PUT' }),

  patch: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, body, method: 'PATCH' }),

  delete: <T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * Example usage:
 *
 * // In a component or service:
 * import { apiClient } from '@/lib/apiClient';
 *
 * async function fetchEvents() {
 *   try {
 *     const events = await apiClient.get('/api/events');
 *     return events;
 *   } catch (error) {
 *     console.error('Failed to fetch events:', error);
 *     throw error;
 *   }
 * }
 *
 * async function createBooking(eventId: string) {
 *   try {
 *     const booking = await apiClient.post('/api/bookings', {
 *       eventId,
 *       ticketCount: 2
 *     });
 *     return booking;
 *   } catch (error) {
 *     if (error.status === 401) {
 *       // Not authenticated
 *     } else if (error.status === 403) {
 *       // Not authorized
 *     }
 *     throw error;
 *   }
 * }
 */
