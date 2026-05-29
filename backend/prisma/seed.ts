import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const books = [
  { isbn: '978-7-229-03093-3', title: '三体', author: '刘慈欣', category: '科幻小说', publisher: '重庆出版社', price: 23.00, totalCopies: 5, description: '地球文明与三体文明的首次接触，中国科幻文学的里程碑' },
  { isbn: '978-7-229-10092-6', title: '三体II：黑暗森林', author: '刘慈欣', category: '科幻小说', publisher: '重庆出版社', price: 32.00, totalCopies: 4, description: '面壁计划与黑暗森林法则，宇宙社会学的残酷真相' },
  { isbn: '978-7-229-10093-3', title: '三体III：死神永生', author: '刘慈欣', category: '科幻小说', publisher: '重庆出版社', price: 38.00, totalCopies: 4, description: '降维打击与宇宙的终极命运' },
  { isbn: '978-7-5063-8654-4', title: '活着', author: '余华', category: '文学小说', publisher: '作家出版社', price: 28.00, totalCopies: 8, description: '讲述了在大时代背景下，徐福贵的人生和家庭不断经受苦难的故事' },
  { isbn: '978-7-5302-1959-1', title: '许三观卖血记', author: '余华', category: '文学小说', publisher: '北京十月文艺出版社', price: 39.50, totalCopies: 5, description: '以卖血为线索，讲述了一个普通中国家庭在时代变迁中的生存故事' },
  { isbn: '978-7-5442-5399-4', title: '百年孤独', author: '加西亚·马尔克斯', category: '文学名著', publisher: '南海出版公司', price: 39.50, totalCopies: 6, description: '魔幻现实主义文学的代表作，布恩迪亚家族七代人的传奇故事' },
  { isbn: '978-7-5442-7667-2', title: '霍乱时期的爱情', author: '加西亚·马尔克斯', category: '文学名著', publisher: '南海出版公司', price: 49.50, totalCopies: 4, description: '一段跨越半个多世纪的爱情史诗，穷尽了所有爱情的可能性' },
  { isbn: '978-7-02-007066-4', title: '红楼梦', author: '曹雪芹', category: '文学名著', publisher: '人民文学出版社', price: 59.70, totalCopies: 10, description: '中国古典四大名著之首，以贾宝玉、林黛玉的爱情悲剧为主线' },
  { isbn: '978-7-02-000873-5', title: '西游记', author: '吴承恩', category: '文学名著', publisher: '人民文学出版社', price: 47.20, totalCopies: 8, description: '唐僧师徒四人西天取经的神话故事，中国古典四大名著之一' },
  { isbn: '978-7-02-000220-7', title: '三国演义', author: '罗贯中', category: '文学名著', publisher: '人民文学出版社', price: 43.00, totalCopies: 8, description: '描绘了东汉末年到西晋初年近百年的历史风云' },
  { isbn: '978-7-111-40701-0', title: '算法导论', author: 'Thomas H.Cormen', category: '计算机', publisher: '机械工业出版社', price: 128.00, totalCopies: 3, description: '计算机算法领域的经典教材，全面介绍了各种算法的设计与分析' },
  { isbn: '978-7-111-35779-7', title: '深入理解Java虚拟机', author: '周志明', category: '计算机', publisher: '机械工业出版社', price: 79.00, totalCopies: 6, description: 'JVM进阶必读，深入剖析JVM内存管理、类加载、并发等核心机制' },
  { isbn: '978-7-115-29152-3', title: 'Python编程：从入门到实践', author: 'Eric Matthes', category: '计算机', publisher: '人民邮电出版社', price: 89.00, totalCopies: 10, description: '零基础学Python的最佳入门书，项目驱动式学习' },
  { isbn: '978-7-111-54250-1', title: '设计模式：可复用面向对象软件的基础', author: 'GoF', category: '计算机', publisher: '机械工业出版社', price: 79.00, totalCopies: 4, description: '面向对象设计的圣经，23种经典设计模式的权威指南' },
  { isbn: '978-7-115-48600-4', title: 'JavaScript高级程序设计', author: 'Matt Frisbie', category: '计算机', publisher: '人民邮电出版社', price: 129.00, totalCopies: 5, description: '前端开发必读红宝书，全面覆盖ES6+新特性' },
  { isbn: '978-7-111-35066-8', title: '人月神话', author: 'Frederick P. Brooks Jr.', category: '计算机', publisher: '机械工业出版社', price: 69.00, totalCopies: 3, description: '软件工程经典之作，探讨大型项目管理中的人与团队问题' },
  { isbn: '978-7-208-06674-0', title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', publisher: '中信出版社', price: 68.00, totalCopies: 7, description: '从认知革命到科学革命，讲述人类如何从动物变成上帝' },
  { isbn: '978-7-5086-7689-0', title: '未来简史', author: '尤瓦尔·赫拉利', category: '历史', publisher: '中信出版社', price: 68.00, totalCopies: 5, description: '探讨人类在解决了饥荒、瘟疫和战争后的新追求' },
  { isbn: '978-7-5086-4735-7', title: '枪炮、病菌与钢铁', author: '贾雷德·戴蒙德', category: '历史', publisher: '中信出版社', price: 45.00, totalCopies: 4, description: '普利策奖获奖作品，探究人类社会发展不平等的根源' },
  { isbn: '978-7-100-10976-7', title: '理想国', author: '柏拉图', category: '哲学', publisher: '商务印书馆', price: 36.00, totalCopies: 3, description: '西方哲学奠基之作，探讨正义与理想城邦的构建' },
  { isbn: '978-7-100-10619-3', title: '纯粹理性批判', author: '康德', category: '哲学', publisher: '商务印书馆', price: 58.00, totalCopies: 2, description: '康德批判哲学的奠基之作，西方哲学史上最重要的著作之一' },
  { isbn: '978-7-5086-3556-8', title: '思考，快与慢', author: '丹尼尔·卡尼曼', category: '哲学', publisher: '中信出版社', price: 69.00, totalCopies: 5, description: '诺贝尔经济学奖得主的行为经济学经典，揭示思维的两种模式' },
  { isbn: '978-7-111-45403-8', title: '经济学原理（微观）', author: '曼昆', category: '经济管理', publisher: '北京大学出版社', price: 89.00, totalCopies: 6, description: '全球最受欢迎的经济学入门教材，通俗易懂又深刻严谨' },
  { isbn: '978-7-111-45404-5', title: '经济学原理（宏观）', author: '曼昆', category: '经济管理', publisher: '北京大学出版社', price: 75.00, totalCopies: 6, description: '宏观经济学经典教材，深入浅出讲解经济运行的奥秘' },
  { isbn: '978-7-5086-8200-6', title: '原则', author: '瑞·达利欧', category: '经济管理', publisher: '中信出版社', price: 98.00, totalCopies: 4, description: '桥水基金创始人毕生经验总结，生活与工作的原则' },
  { isbn: '978-7-5086-5102-6', title: '从0到1', author: '彼得·蒂尔', category: '经济管理', publisher: '中信出版社', price: 45.00, totalCopies: 5, description: 'PayPal创始人关于创业与创新的思考，如何建立垄断企业' },
  { isbn: '978-7-02-016477-6', title: '平凡的世界', author: '路遥', category: '文学小说', publisher: '人民文学出版社', price: 108.00, totalCopies: 7, description: '茅盾文学奖获奖作品，中国改革开放前后农村青年的奋斗史诗' },
  { isbn: '978-7-5302-1108-3', title: '围城', author: '钱钟书', category: '文学小说', publisher: '北京十月文艺出版社', price: 39.00, totalCopies: 6, description: '中国现代文学经典，"围在城里的人想逃出来，城外的人想冲进去"' },
  { isbn: '978-7-5447-9543-2', title: '小王子', author: '圣埃克苏佩里', category: '文学名著', publisher: '译林出版社', price: 22.00, totalCopies: 10, description: '写给成年人的童话，关于爱与责任的永恒寓言' },
  { isbn: '978-7-5327-9024-1', title: '1984', author: '乔治·奥威尔', category: '文学名著', publisher: '上海译文出版社', price: 35.00, totalCopies: 6, description: '反乌托邦文学经典，"老大哥在看着你"的来源' },
]

const readers = [
  { name: '张三', gender: '男', phone: '13800138001', email: 'zhangsan@qq.com', address: '北京市朝阳区' },
  { name: '李四', gender: '女', phone: '13800138002', email: 'lisi@163.com', address: '上海市浦东新区' },
  { name: '王五', gender: '男', phone: '13800138003', email: 'wangwu@gmail.com', address: '广州市天河区' },
  { name: '赵六', gender: '女', phone: '13800138004', email: 'zhaoliu@qq.com', address: '深圳市南山区' },
  { name: '孙七', gender: '男', phone: '13800138005', email: 'sunqi@126.com', address: '杭州市西湖区' },
  { name: '周八', gender: '女', phone: '13800138006', email: 'zhouba@qq.com', address: '成都市武侯区' },
  { name: '吴九', gender: '男', phone: '13800138007', email: 'wujiu@163.com', address: '武汉市洪山区' },
  { name: '郑十', gender: '女', phone: '13800138008', email: 'zhengshi@qq.com', address: '南京市鼓楼区' },
]

async function main() {
  console.log('Cleaning old data...')
  await prisma.borrowRecord.deleteMany()
  await prisma.book.deleteMany()
  await prisma.reader.deleteMany()

  console.log('Creating books...')
  const createdBooks = []
  for (const book of books) {
    const created = await prisma.book.create({
      data: { ...book, availableCopies: book.totalCopies }
    })
    createdBooks.push(created)
  }
  console.log(`  ${createdBooks.length} books created`)

  console.log('Creating readers...')
  const createdReaders = []
  for (let i = 0; i < readers.length; i++) {
    const r = readers[i]
    const readerNo = 'R' + new Date().getFullYear() + String(i + 1).padStart(3, '0')
    const created = await prisma.reader.create({
      data: { ...r, readerNo }
    })
    createdReaders.push(created)
  }
  console.log(`  ${createdReaders.length} readers created`)

  // Create some borrow records
  console.log('Creating borrow records...')
  const today = new Date()
  const borrowData = [
    { bookIdx: 0, readerIdx: 0, daysAgo: 2, days: 30 },
    { bookIdx: 1, readerIdx: 1, daysAgo: 5, days: 30 },
    { bookIdx: 10, readerIdx: 2, daysAgo: 8, days: 30 },
    { bookIdx: 16, readerIdx: 3, daysAgo: 35, days: 30 }, // overdue
    { bookIdx: 3, readerIdx: 4, daysAgo: 15, days: 30 },
    { bookIdx: 27, readerIdx: 5, daysAgo: 40, days: 30 }, // overdue
    { bookIdx: 12, readerIdx: 6, daysAgo: 3, days: 14 },
    { bookIdx: 5, readerIdx: 7, daysAgo: 20, days: 30 },
  ]

  for (const b of borrowData) {
    const borrowDate = new Date(today.getTime() - b.daysAgo * 86400000)
    const dueDate = new Date(borrowDate.getTime() + b.days * 86400000)
    const isOverdue = dueDate < today

    await prisma.$transaction([
      prisma.borrowRecord.create({
        data: {
          bookId: createdBooks[b.bookIdx].id,
          readerId: createdReaders[b.readerIdx].id,
          borrowDate,
          dueDate,
          status: isOverdue ? 'overdue' : 'borrowed',
        }
      }),
      prisma.book.update({
        where: { id: createdBooks[b.bookIdx].id },
        data: { availableCopies: { decrement: 1 } },
      }),
    ])
  }
  console.log(`  8 borrow records created (including 2 overdue)`)

  console.log('\nSeed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())