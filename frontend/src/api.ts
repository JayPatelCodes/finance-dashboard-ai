import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL })

export const uploadCsv = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ inserted: number }>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export type Tx = {
  Date: string
  Description: string
  Amount: number
  Category: string
}

export const fetchTransactions = async (): Promise<Tx[]> => {
  const { data } = await api.get<{ items: Tx[] }>('/transactions')
  return data.items
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
