import { apiRequest } from './api'

interface AuthResponse {
  message?: string
  token: string
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
}

export async function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

interface RegisterResponse extends AuthResponse {}

export async function register(name: string, email: string, password: string) {
  return apiRequest<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
}
