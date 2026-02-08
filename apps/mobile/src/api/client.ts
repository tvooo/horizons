import { APIClient } from 'shared'
import { authClient } from '../lib/auth-client'

// TODO: Update this to point to your backend URL
// For iOS simulator, use localhost; for Android emulator, use 10.0.2.2
// For physical device, use your computer's IP address on the local network
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000' // Development
  : 'https://your-production-api.com' // Production

class AuthenticatedAPIClient extends APIClient {
  protected override async doFetch(url: string, init?: RequestInit): Promise<Response> {
    const cookie = await authClient.getCookie()

    return fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        ...(cookie ? { Cookie: cookie } : {}),
      },
    })
  }
}

export const api = new AuthenticatedAPIClient(API_BASE_URL)
