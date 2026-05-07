import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL })

// Always read fresh from localStorage so token is never stale
api.interceptors.request.use(config => {
  const token = localStorage.getItem('finai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export type Tx = { Date: string; Description: string; Amount: number; Category: string }
export type ForecastData = { points: { date: string; predicted: number }[]; summary: string }
export type User = { id: string; name: string; email: string; avatar?: string }
export type AuthResponse = { access_token: string; token_type: string; user: User }

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/signup', { name, email, password })
  return data
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export const googleAuth = async (token: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/google', { token })
  return data
}

export const uploadCsv = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ inserted: number }>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const fetchTransactions = async (month?: string): Promise<Tx[]> => {
  const { data } = await api.get<{ items: Tx[] }>('/transactions', { params: month ? { month } : {} })
  return data.items
}

export const fetchMonths = async (): Promise<string[]> => {
  const { data } = await api.get<{ months: string[] }>('/transactions/months')
  return data.months
}

export const clearTransactions = async () => {
  const { data } = await api.delete('/transactions')
  return data
}

export const fetchInsights = async () => {
  const { data } = await api.get<{ insights: Array<{ key: string; value: string }> }>('/insights')
  return data.insights
}

export const askChat = async (question: string) => {
  const { data } = await api.post<{ answer: string }>('/chat', { question })
  return data.answer
}

export const fetchForecast = async () => {
  const { data } = await api.get<{ points: Array<{ date: string; predicted: number }>; summary: string }>('/forecast')
  return data
}

// ── Budgets ────────────────────────────────────────────────────────────────

export type Budget = {
  id: string
  category: string
  amount: number
  month: string | null
  spent: number
  percent: number
}

export const fetchBudgets = async (month?: string): Promise<Budget[]> => {
  const { data } = await api.get<Budget[]>('/budgets', { params: month ? { month } : {} })
  return data
}

export const createBudget = async (category: string, amount: number, month: string | null) => {
  const { data } = await api.post('/budgets', { category, amount, month })
  return data
}

export const deleteBudget = async (id: string) => {
  const { data } = await api.delete(`/budgets/${id}`)
  return data
}

// ── Recurring ──────────────────────────────────────────────────────────────

export type RecurringItem = {
  description: string
  occurrences: number
  avg_amount: number
  last_date: string
  type: 'income' | 'expense'
}

export const fetchRecurring = async (): Promise<RecurringItem[]> => {
  const { data } = await api.get<{ items: RecurringItem[] }>('/recurring')
  return data.items
}

export const updateCategory = async (description: string, category: string) => {
  const { data } = await api.patch(`/transactions/${encodeURIComponent(description)}/category`, { category })
  return data
}
