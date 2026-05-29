import request from './request'

export interface BorrowRecord {
  id: number
  bookId: number
  readerId: number
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
  book?: { title: string; isbn?: string }
  reader?: { name: string; readerNo: string }
}

const statusMap: Record<string, string> = {
  borrowed: '在借',
  returned: '已还',
  overdue: '逾期',
}

export function mapStatus(status: string): string {
  return statusMap[status] || status
}

export function getBorrows(params: { keyword?: string; status?: string; page?: number; pageSize?: number }) {
  return request.get('/borrows', { params })
}

export function borrowBook(data: { readerId: number; bookId: number; borrowDays?: number }) {
  return request.post('/borrows/borrow', data)
}

export function returnBook(id: number) {
  return request.post(`/borrows/return/${id}`)
}

export function getDashboardStats() {
  return request.get('/borrows/stats/dashboard')
}