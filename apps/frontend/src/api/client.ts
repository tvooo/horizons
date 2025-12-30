import { APIClient } from 'shared'

// In production, use current origin; in development, use VITE_API_URL or localhost
const getAPIBaseURL = () => {
  if (import.meta.env.PROD) {
    return window.location.origin
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

const API_BASE_URL = getAPIBaseURL()

export const api = new APIClient(API_BASE_URL)
