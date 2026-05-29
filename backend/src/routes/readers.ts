import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/readers - list
router.get('/', async (req: Request, res: Response) => {
  try {
    const { keyword, page = '1', pageSize = '10' } = req.query
    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    const where: any = {}
    if (keyword) {
      where.OR = [
        { name: { contains: String(keyword) } },
        { readerNo: { contains: String(keyword) } },
        { phone: { contains: String(keyword) } },
      ]
    }

    const [list, total] = await Promise.all([
      prisma.reader.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.reader.count({ where }),
    ])

    res.json({ code: 200, data: { list, total, page: Number(page), pageSize: take } })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Query failed', error })
  }
})

// GET /api/readers/:id - single
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reader = await prisma.reader.findUnique({ where: { id: Number(req.params.id) } })
    if (!reader) return res.status(404).json({ code: 404, message: 'Reader not found' })
    res.json({ code: 200, data: reader })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Query failed', error })
  }
})

// POST /api/readers - create
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, gender, phone, email, address } = req.body
    const year = new Date().getFullYear()
    const count = await prisma.reader.count()
    const readerNo = 'R' + year + String(count + 1).padStart(3, '0')

    const reader = await prisma.reader.create({
      data: { readerNo, name, gender, phone, email, address },
    })
    res.json({ code: 200, data: reader, message: 'Create success' })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ code: 400, message: 'Reader number exists' })
    }
    res.status(500).json({ code: 500, message: 'Create failed', error })
  }
})

// PUT /api/readers/:id - update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const { name, gender, phone, email, address } = req.body
    const reader = await prisma.reader.update({
      where: { id },
      data: { name, gender, phone, email, address },
    })
    res.json({ code: 200, data: reader, message: 'Update success' })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Update failed', error })
  }
})

// DELETE /api/readers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const activeBorrows = await prisma.borrowRecord.count({
      where: { readerId: id, status: { in: ['borrowed', 'overdue'] } },
    })
    if (activeBorrows > 0) {
      return res.status(400).json({ code: 400, message: 'Reader has active borrows' })
    }
    await prisma.reader.delete({ where: { id } })
    res.json({ code: 200, message: 'Delete success' })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Delete failed', error })
  }
})

export default router