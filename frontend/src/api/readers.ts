import request from './request'

export interface Reader {
  id: number
  readerNo: string
  name: string
  gender: string
  phone: string
  email: string | null
  address: string | null
  createTime?: string
  createdAt: string
}

export function getReaders(params: { keyword?: string; page?: number; pageSize?: number }) {
  return request.get('/readers', { params })
}

export function getReader(id: number) {
  return request.get(`/readers/${id}`)
}

export function createReader(data: Partial<Reader>) {
  return request.post('/readers', data)
}

export function updateReader(id: number, data: Partial<Reader>) {
  return request.put(`/readers/${id}`, data)
}

export function deleteReader(id: number) {
  return request.delete(`/readers/${id}`)
}