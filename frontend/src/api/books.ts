import request from './request'

export interface Book {
  id: number
  isbn: string
  title: string
  author: string
  category: string
  publisher: string
  price: number
  totalCopies: number
  availableCopies: number
  publishDate: string | null
  description: string | null
  createdAt: string
}

export function getBooks(params: { keyword?: string; category?: string; page?: number; pageSize?: number }) {
  return request.get('/books', { params })
}

export function getBook(id: number) {
  return request.get(`/books/${id}`)
}

export function createBook(data: Partial<Book>) {
  return request.post('/books', data)
}

export function updateBook(id: number, data: Partial<Book>) {
  return request.put(`/books/${id}`, data)
}

export function deleteBook(id: number) {
  return request.delete(`/books/${id}`)
}