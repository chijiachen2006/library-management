# 后端开发学习手册
## 基于你的图书管理系统 (Node.js + Express + Prisma + MySQL)

---

## 🔰 第1课：理解服务器是怎么跑起来的

### 文件：src/index.ts

```ts
import express from 'express'

const app = express()       // ← 创建服务器实例
app.listen(8080, () => {})  // ← 让服务器监听 8080 端口
```

**类比**：Express 就像一个餐厅的前台。
- `app` = 前台接待员
- 端口 8080 = 餐厅的门牌号
- 每个请求 = 走进来的客人

### 中间件是什么？

```ts
app.use(cors())          // "允许任何人进店"
app.use(express.json())  // "能看懂客人递过来的菜单（JSON）"
```

**中间件 = 处理请求的流水线**。每个请求依次经过中间件处理后才到达路由。

```
请求 → cors() → json() → 路由处理器 → 响应
```

---

## 🔰 第2课：路由 = 餐厅菜单

### 文件：src/routes/books.ts

| HTTP 方法 | URL 路径 | 作用 |
|-----------|----------|------|
| GET | /api/books | 查所有图书 |
| GET | /api/books/3 | 查 ID=3 的图书 |
| POST | /api/books | 新增一本图书 |
| PUT | /api/books/3 | 更新 ID=3 的图书 |
| DELETE | /api/books/3 | 删除 ID=3 的图书 |

这就是 **RESTful API** 的标准设计——用 HTTP 方法表达"做什么"，用 URL 表达"对谁做"。

### 一行一行读懂 GET 路由

```ts
router.get('/', async (req: Request, res: Response) => {
  //   ↑           ↑          ↑               ↑
  //   |           |          |               └── 响应对象（用来回数据给前端）
  //   |           |          └── 请求对象（前端传过来的数据在这里）
  //   |           └── async 表示里面可以用 await（等数据库）
  //   └── 匹配 GET 请求
  try {
    const { keyword, category } = req.query   // 从 URL ?keyword=三体 中取值
    const page = Number(req.query.page) || 1   // 没传就默认第1页

    const where: any = {}
    if (keyword) {
      where.OR = [                             // OR 表示多个字段模糊搜索
        { title: { contains: keyword } },       // 书名包含关键词
        { author: { contains: keyword } },      // 作者包含关键词
      ]
    }

    const list = await prisma.book.findMany({   // 从数据库查数据
      where,                                     // 筛选条件
      skip: (page - 1) * 10,                    // 跳过前N条（分页）
      take: 10,                                  // 取10条
      orderBy: { createdAt: 'desc' },            // 按入库时间倒序
    })

    res.json({ code: 200, data: list })          // 返回 JSON 给前端
  } catch (error) {
    res.status(500).json({ code: 500, message: '出错了' })
  }
})
```

---

## 🔰 第3课：Prisma = 不用写 SQL 的数据库操作

### 文件：prisma/schema.prisma

```prisma
model Book {
  id     Int    @id @default(autoincrement())
  title  String @db.VarChar(200)
  author String @db.VarChar(100)
  // ...
}
```

定义了 Book 这个"模型"后，Prisma 自动生成操作方法：

| Prisma 方法 | 等价的 SQL |
|-------------|-----------|
| `prisma.book.findMany()` | `SELECT * FROM book` |
| `prisma.book.findUnique({where:{id:1}})` | `SELECT * FROM book WHERE id=1` |
| `prisma.book.create({data:{...}})` | `INSERT INTO book VALUES(...)` |
| `prisma.book.update({where:{id:1},data:{...}})` | `UPDATE book SET ... WHERE id=1` |
| `prisma.book.delete({where:{id:1}})` | `DELETE FROM book WHERE id=1` |
| `prisma.book.count({where:{...}})` | `SELECT COUNT(*) FROM book WHERE ...` |

---

## 🔰 第4课：事务 = 要么全做，要么全不做

### 文件：src/routes/borrows.ts（借书逻辑）

```ts
// 借书时要做两件事：1) 创建借阅记录 2) 库存-1
// 这两个操作必须同时成功或同时失败

const [record] = await prisma.$transaction([
  prisma.borrowRecord.create({ data: {...} }),         // 第1步
  prisma.book.update({                                  // 第2步
    where: { id: bookId },
    data: { availableCopies: { decrement: 1 } },        // 可借-1
  }),
])
```

`$transaction` 保证：如果第2步失败，第1步自动回滚——**不会出现"借书记录创建了但库存没扣"的 bug**。

---

## 🔰 第5课：req 和 res 完全手册

```ts
router.post('/:id/action', async (req, res) => {
  // ===== req（Request：前端发来的东西）=====
  req.params.id      // URL 路径参数  /api/books/5  →  "5"
  req.query.keyword  // URL 查询参数  ?keyword=三体  →  "三体"
  req.body.title     // 请求体（POST/PUT 时前端传的 JSON）
  req.method         // "GET" / "POST" / "PUT" / "DELETE"
  req.path           // "/api/books"

  // ===== res（Response：你回给前端的东西）=====
  res.json({ code: 200, data: {...} })     // 返回 JSON（最常用）
  res.status(404).json({ message: '没找到' }) // 返回 404 错误
  res.status(500).json({ message: '服务器错误' }) // 返回 500 错误
})
```

---

## 🏋️ 接下来：动手练习

你可以在当前项目中添加以下功能来巩固学习：

1. **给图书加个"搜索次数统计"** — 每次搜索时 count+1
2. **添加分类管理 API** — 独立的分类 CRUD
3. **添加借阅历史导出** — 一个接口返回指定读者的所有借阅记录

想从哪个练习开始？我可以带着你一步步写。