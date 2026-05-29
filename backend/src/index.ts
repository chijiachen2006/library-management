import express from 'express'
import cors from 'cors'
import booksRouter from './routes/books'
import readersRouter from './routes/readers'
import borrowsRouter from './routes/borrows'

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use('/api/books', booksRouter)
app.use('/api/readers', readersRouter)
app.use('/api/borrows', borrowsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log('Library Management API started on port ' + PORT)
  console.log('API: http://localhost:' + PORT + '/api')
})