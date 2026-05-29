import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/books - list
router.get('/', async (req: Request, res: Response) => {
  try {
    const { keyword, category, page = '1', pageSize = '10' } = req.query
    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    const where: any = {}
    if (keyword) {
      where.OR = [
        { title: { contains: String(keyword) } },
        { author: { contains: String(keyword) } },
        { isbn: { contains: String(keyword) } },
      ]
    }
    if (category) {
      where.category = String(category)
    }

    const [list, total] = await Promise.all([
      prisma.book.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.book.count({ where }),
    ])

    res.json({ code: 200, data: { list, total, page: Number(page), pageSize: take } })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Query failed', error })
  }
})

// GET /api/books/:id - single
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const book = await prisma.book.findUnique({ where: { id: Number(req.params.id) } })
    if (!book) return res.status(404).json({ code: 404, message: 'Book not found' })
    res.json({ code: 200, data: book })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Query failed', error })
  }
})

// POST /api/books - create
router.post('/', async (req: Request, res: Response) => {
  try {
    const { isbn, title, author, category, publisher, price, totalCopies, publishDate, description } = req.body
    const copies = Number(totalCopies) || 1
    const book = await prisma.book.create({
      data: {
        isbn, title, author, category, publisher,
        price: Number(price),
        totalCopies: copies,
        availableCopies: copies,
        publishDate: publishDate ? new Date(publishDate) : null,
        description,
      },
    })
    res.json({ code: 200, data: book, message: 'Create success' })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ code: 400, message: 'ISBN already exists' })
    }
    res.status(500).json({ code: 500, message: 'Create failed', error })
  }
})

// PUT /api/books/:id - update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.book.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ code: 404, message: 'Book not found' })

    const { isbn, title, author, category, publisher, price, totalCopies, publishDate, description } = req.body
    const newTotal = totalCopies !== undefined ? Number(totalCopies) : existing.totalCopies
    const borrowed = existing.totalCopies - existing.availableCopies
    const newAvailable = Math.max(0, newTotal - borrowed)

    const book = await prisma.book.update({
      where: { id },
      data: {
        isbn, title, author, category, publisher,
        price: price !== undefined ? Number(price) : undefined,
        totalCopies: newTotal,
        availableCopies: newAvailable,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        description,
      },
    })
    res.json({ code: 200, data: book, message: 'Update success' })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ code: 400, message: 'ISBN already exists' })
    }
    res.status(500).json({ code: 500, message: 'Update failed', error })
  }
})

// DELETE /api/books/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const activeBorrows = await prisma.borrowRecord.count({
      where: { bookId: id, status: { in: ['borrowed', 'overdue'] } },
    })
    if (activeBorrows > 0) {
      return res.status(400).json({ code: 400, message: 'Book has active borrows' })
    }
    await prisma.book.delete({ where: { id } })
    res.json({ code: 200, message: 'Delete success' })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Delete failed', error })
  }
})

export default router