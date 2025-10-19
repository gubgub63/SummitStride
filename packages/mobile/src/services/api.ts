import { API_URL } from '../config/env'

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown
  token?: string | null
  headers?: Record<string, string>
}

interface ApiErrorPayload {
  error?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  }

  let bodyToSend: BodyInit | undefined
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    bodyToSend = JSON.stringify(options.body)
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: bodyToSend,
  })

  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const payload = isJson ? await response.json() : undefined

  if (!response.ok) {
    const errorPayload = (payload ?? {}) as ApiErrorPayload
    const message = errorPayload.error || errorPayload.message || `Erreur API (${response.status})`
    throw new ApiError(response.status, message, errorPayload.details)
  }

  return payload as TResponse
}
