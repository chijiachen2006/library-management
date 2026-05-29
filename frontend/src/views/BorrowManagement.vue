<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBorrows, borrowBook, returnBook, mapStatus } from '../api/borrows'
import { getBooks } from '../api/books'
import { getReaders } from '../api/readers'
import type { BorrowRecord } from '../api/borrows'
import type { Book } from '../api/books'
import type { Reader } from '../api/readers'

const records = ref<BorrowRecord[]>([])
const total = ref(0)
const loading = ref(false)
const filterStatus = ref('')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const borrowDialogVisible = ref(false)
const returnDialogVisible = ref(false)
const borrowing = ref(false)
const allBooks = ref<Book[]>([])
const allReaders = ref<Reader[]>([])
const borrowForm = reactive({ readerId: 0, bookId: 0, borrowDays: 30 })
const returnTarget = ref<BorrowRecord | null>(null)

async function fetch() {
  loading.value = true
  try {
    const m: Record<string,string> = { '在借':'borrowed','逾期':'overdue','已还':'returned' }
    const res = await getBorrows({ keyword: keyword.value, status: m[filterStatus.value] || '', page: currentPage.value, pageSize: pageSize.value })
    records.value = res.data.list; total.value = res.data.total
  } finally { loading.value = false }
}
function doSearch() { currentPage.value = 1; fetch() }
watch(currentPage, fetch)

async function openBorrow() {
  try { const [br,rr] = await Promise.all([getBooks({ pageSize: 999 }), getReaders({ pageSize: 999 })]); allBooks.value = br.data.list.filter((b:Book) => b.availableCopies > 0); allReaders.value = rr.data.list } catch {}
  borrowForm.readerId = 0; borrowForm.bookId = 0; borrowForm.borrowDays = 30; borrowDialogVisible.value = true
}
async function handleBorrow() {
  if (!borrowForm.readerId || !borrowForm.bookId) { ElMessage.warning('请选择读者和图书'); return }
  borrowing.value = true
  try { await borrowBook(borrowForm); ElMessage.success('借书成功'); borrowDialogVisible.value = false; fetch() } finally { borrowing.value = false }
}
function openReturn(row: BorrowRecord) { returnTarget.value = row; returnDialogVisible.value = true }
async function handleReturn() {
  if (!returnTarget.value) return
  try { await ElMessageBox.confirm('确认归还？', '还书确认', { type: 'info' }); await returnBook(returnTarget.value.id); ElMessage.success('还书成功'); returnDialogVisible.value = false; fetch() } catch {}
}
function stTag(s: string) { if (s==='overdue') return 'danger'; if (s==='returned') return 'info'; return 'warning' }

onMounted(fetch)
</script>

<template>
  <div class="page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input v-model="keyword" placeholder="读者 / 书名 / 编号" clearable style="width:240px" @keyup.enter="doSearch" /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable @change="doSearch" style="width:110px">
            <el-option label="在借" value="在借" /><el-option label="逾期" value="逾期" /><el-option label="已还" value="已还" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="btn-primary" @click="openBorrow"><el-icon><Plus /></el-icon>借书登记</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="records" stripe v-loading="loading">
        <el-table-column label="读者" width="80"><template #default="{ row }"><span style="font-weight:500">{{ row.reader?.name }}</span></template></el-table-column>
        <el-table-column label="编号" width="120"><template #default="{ row }">{{ row.reader?.readerNo }}</template></el-table-column>
        <el-table-column label="图书" min-width="160"><template #default="{ row }"><span style="color:var(--accent);font-weight:500">{{ row.book?.title }}</span></template></el-table-column>
        <el-table-column label="ISBN" width="200"><template #default="{ row }">{{ row.book?.isbn }}</template></el-table-column>
        <el-table-column label="借阅日期" width="105"><template #default="{ row }">{{ row.borrowDate?.split('T')[0] }}</template></el-table-column>
        <el-table-column label="应还日期" width="105"><template #default="{ row }">{{ row.dueDate?.split('T')[0] }}</template></el-table-column>
        <el-table-column label="归还日期" width="105"><template #default="{ row }"><span :class="!row.returnDate&&'dim'">{{ row.returnDate?.split('T')[0] || '—' }}</span></template></el-table-column>
        <el-table-column label="状态" width="70" align="center">
          <template #default="{ row }"><el-tag :type="stTag(row.status)" size="small" effect="dark">{{ mapStatus(row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status==='borrowed'||row.status==='overdue'" type="success" size="small" @click="openReturn(row)">还书</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager-row"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" background small /></div>
    </div>

    <el-dialog v-model="borrowDialogVisible" title="借书登记" width="480px" destroy-on-close>
      <el-form :model="borrowForm" label-width="70px">
        <el-form-item label="读者"><el-select v-model="borrowForm.readerId" placeholder="选择读者" style="width:100%" filterable><el-option v-for="r in allReaders" :key="r.id" :label="r.name + ' (' + r.readerNo + ')'" :value="r.id" /></el-select></el-form-item>
        <el-form-item label="图书"><el-select v-model="borrowForm.bookId" placeholder="选择图书" style="width:100%" filterable><el-option v-for="b in allBooks" :key="b.id" :label="b.title + ' (可借' + b.availableCopies + '册)'" :value="b.id" /></el-select></el-form-item>
        <el-form-item label="天数"><el-input-number v-model="borrowForm.borrowDays" :min="1" :max="90" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button class="btn-secondary" @click="borrowDialogVisible = false">取消</el-button><el-button class="btn-primary" :loading="borrowing" @click="handleBorrow">确认借书</el-button></template>
    </el-dialog>

    <el-dialog v-model="returnDialogVisible" title="还书确认" width="400px">
      <div v-if="returnTarget" class="return-box">
        <div class="return-icon"><el-icon :size="28" color="var(--accent)"><CircleCheckFilled /></el-icon></div>
        <p class="return-title">《{{ returnTarget.book?.title }}》</p>
        <div class="return-meta">
          <span>借阅人：{{ returnTarget.reader?.name }}</span>
          <span>应还日期：{{ returnTarget.dueDate?.split('T')[0] }}</span>
        </div>
      </div>
      <template #footer><el-button class="btn-secondary" @click="returnDialogVisible = false">取消</el-button><el-button class="btn-primary" @click="handleReturn">确认归还</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { max-width: 1300px; }
.pager-row { margin-top: 14px; display: flex; justify-content: flex-end; }
.dim { color: var(--text-tertiary); }
.return-box { text-align: center; padding: 8px 0; }
.return-icon { margin-bottom: 12px; }
.return-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.return-meta { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--text-secondary); }
</style>