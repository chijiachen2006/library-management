<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getBooks, createBook, updateBook, deleteBook } from '../api/books'
import type { Book } from '../api/books'

const books = ref<Book[]>([])
const total = ref(0)
const loading = ref(false)
const searchForm = reactive({ keyword: '', category: '' })
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive<Partial<Book>>({
  isbn: '', title: '', author: '', category: '', publisher: '',
  price: 0, totalCopies: 1, publishDate: '', description: ''
})

const categories = ['科幻小说', '文学小说', '文学名著', '计算机', '历史', '哲学', '经济管理', '其他']

const rules: FormRules = {
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }]
}

async function fetchBooks() {
  loading.value = true
  try {
    const res = await getBooks({ keyword: searchForm.keyword, category: searchForm.category, page: currentPage.value, pageSize: pageSize.value })
    books.value = res.data.list; total.value = res.data.total
  } finally { loading.value = false }
}
function doSearch() { currentPage.value = 1; fetchBooks() }
watch(currentPage, fetchBooks)

function openAdd() {
  isEdit.value = false; dialogTitle.value = '新增图书'
  Object.assign(form, { isbn: '', title: '', author: '', category: '', publisher: '', price: 0, totalCopies: 1, publishDate: '', description: '' })
  dialogVisible.value = true
}
function openEdit(row: Book) {
  isEdit.value = true; dialogTitle.value = '编辑图书'
  Object.assign(form, { ...row }); dialogVisible.value = true
}
async function handleDelete(row: Book) {
  try { await ElMessageBox.confirm(`确定删除《${row.title}》？`, '提示', { type: 'warning' }); await deleteBook(row.id); ElMessage.success('已删除'); fetchBooks() } catch {}
}
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false); if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) { await updateBook(form.id as number, form); ElMessage.success('修改成功') }
    else { await createBook(form); ElMessage.success('添加成功') }
    dialogVisible.value = false; fetchBooks()
  } finally { submitting.value = false }
}
onMounted(fetchBooks)
</script>

<template>
  <div class="page">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词"><el-input v-model="searchForm.keyword" placeholder="书名 / 作者 / ISBN" clearable @clear="doSearch" @keyup.enter="doSearch" style="width:260px" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable @change="doSearch" @clear="doSearch" style="width:150px">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="btn-primary" @click="doSearch">搜索</el-button>
          <el-button class="btn-secondary" @click="openAdd"><el-icon><Plus /></el-icon>新增图书</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="books" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="isbn" label="ISBN" width="190" />
        <el-table-column prop="title" label="书名" min-width="160">
          <template #default="{ row }"><span class="link-text">{{ row.title }}</span></template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="publisher" label="出版社" width="140" />
        <el-table-column prop="price" label="定价" width="80"><template #default="{ row }">¥{{ row.price }}</template></el-table-column>
        <el-table-column prop="totalCopies" label="总册" width="60" align="center" />
        <el-table-column prop="availableCopies" label="可借" width="60" align="center">
          <template #default="{ row }">
            <span :class="row.availableCopies === 0 ? 'text-danger' : 'text-success'" style="font-weight:600">{{ row.availableCopies }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager-row">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" background small />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="660px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="ISBN" prop="isbn"><el-input v-model="form.isbn" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="分类" prop="category"><el-select v-model="form.category" style="width:100%"><el-option v-for="c in categories" :key="c" :label="c" :value="c" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="书名" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="作者" prop="author"><el-input v-model="form.author" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="出版社" prop="publisher"><el-input v-model="form.publisher" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="出版日期"><el-date-picker v-model="form.publishDate" type="date" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="定价"><el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="总册数"><el-input-number v-model="form.totalCopies" :min="1" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="简介"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button class="btn-secondary" @click="dialogVisible = false">取消</el-button>
        <el-button class="btn-primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { max-width: 1300px; }
.pager-row { margin-top: 14px; display: flex; justify-content: flex-end; }
.link-text { color: var(--accent); font-weight: 500; cursor: pointer; }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }
</style>