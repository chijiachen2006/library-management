import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

const STATUS_BORROWED = 'borrowed'
const STATUS_RETURNED = 'returned'
const STATUS_OVERDUE = 'overdue'

// GET /api/borrows - list
router.get('/', async (req: Request, res: Response) => {
  try {
    const { keyword, status, page = '1', pageSize = '10' } = req.query
    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    const where: any = {}
    if (status) where.status = String(status)
    if (keyword) {
      where.OR = [
        { reader: { name: { contains: String(keyword) } } },
        { book: { title: { contains: String(keyword) } } },
        { reader: { readerNo: { contains: String(keyword) } } },
      ]
    }

    const [list, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        where,
        skip,
        take,
        orderBy: { borrowDate: 'desc' },
        include: {
          book: { select: { title: true, isbn: true } },
          reader: { select: { name: true, readerNo: true } },
        },
      }),
      prisma.borrowRecord.count({ where }),
    ])

    res.json({ code: 200, data: { list, total, page: Number(page), pageSize: take } })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Query failed', error })
  }
})

// POST /api/borrows/borrow - borrow a book
router.post('/borrow', async (req: Request, res: Response) => {
  try {
    const { readerId, bookId, borrowDays = 30 } = req.body

    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } })
    if (!book) return res.status(404).json({ code: 404, message: 'Book not found' })
    if (book.availableCopies <= 0) {
      return res.status(400).json({ code: 400, message: 'No copies available' })
    }

    const reader = await prisma.reader.findUnique({ where: { id: Number(readerId) } })
    if (!reader) return res.status(404).json({ code: 404, message: 'Reader not found' })

    const borrowDate = new Date()
    const dueDate = new Date(borrowDate.getTime() + Number(borrowDays) * 86400000)

    const [record] = await prisma.$transaction([
      prisma.borrowRecord.create({
        data: {
          bookId: Number(bookId),
          readerId: Number(readerId),
          borrowDate,
          dueDate,
          status: STATUS_BORROWED,
        },
        include: {
          book: { select: { title: true } },
          reader: { select: { name: true } },
        },
      }),
      prisma.book.update({
        where: { id: Number(bookId) },
        data: { availableCopies: { decrement: 1 } },
      }),
    ])

    res.json({ code: 200, data: record, message: 'Borrow success' })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Borrow failed', error })
  }
})

// POST /api/borrows/return/:id - return a book
router.post('/return/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const record = await prisma.borrowRecord.findUnique({ where: { id } })
    if (!record) return res.status(404).json({ code: 404, message: 'Record not found' })
    if (record.status === STATUS_RETURNED) {
      return res.status(400).json({ code: 400, message: 'Already returned' })
    }

    const returnDate = new Date()

    const [updatedRecord] = await prisma.$transaction([
      prisma.borrowRecord.update({
        where: { id },
        data: { returnDate, status: STATUS_RETURNED },
        include: {
          book: { select: { title: true } },
          reader: { select: { name: true } },
        },
      }),
      prisma.book.update({
        where: { id: record.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ])

    res.json({ code: 200, data: updatedRecord, message: 'Return success' })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Return failed', error })
  }
})

// GET /api/borrows/stats/dashboard - dashboard stats
router.get('/stats/dashboard', async (_req: Request, res: Response) => {
  try {
    const [totalBooks, availableBooks, borrowedBooks, overdueBooks, totalReaders, activeBorrows] = await Promise.all([
      prisma.book.count(),
      prisma.book.aggregate({ _sum: { availableCopies: true } }),
      prisma.borrowRecord.count({ where: { status: STATUS_BORROWED } }),
      prisma.borrowRecord.count({ where: { status: STATUS_OVERDUE } }),
      prisma.reader.count(),
      prisma.borrowRecord.count({ where: { status: { in: [STATUS_BORROWED, STATUS_OVERDUE] } } }),
    ])

    res.json({
      code: 200,
      data: {
        totalBooks,
        availableBooks: availableBooks._sum.availableCopies || 0,
        borrowedBooks,
        overdueBooks,
        totalReaders,
        activeBorrows,
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Query failed', error })
  }
})

export default router