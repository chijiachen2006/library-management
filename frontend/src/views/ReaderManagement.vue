<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getReaders, createReader, updateReader, deleteReader } from '../api/readers'
import type { Reader } from '../api/readers'

const readers = ref<Reader[]>([])
const total = ref(0)
const loading = ref(false)
const keyword = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive<Partial<Reader>>({ name: '', gender: '男', phone: '', email: '', address: '' })
const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
}

async function fetch() {
  loading.value = true
  try { const r = await getReaders({ keyword: keyword.value, page: currentPage.value, pageSize: pageSize.value }); readers.value = r.data.list; total.value = r.data.total } finally { loading.value = false }
}
function doSearch() { currentPage.value = 1; fetch() }
watch(currentPage, fetch)

function openAdd() { isEdit.value = false; dialogTitle.value = '新增读者'; Object.assign(form, { name: '', gender: '男', phone: '', email: '', address: '' }); dialogVisible.value = true }
function openEdit(row: Reader) { isEdit.value = true; dialogTitle.value = '编辑读者'; Object.assign(form, { ...row }); dialogVisible.value = true }
async function handleDelete(row: Reader) { try { await ElMessageBox.confirm(`删除「${row.name}」？`, '提示', { type: 'warning' }); await deleteReader(row.id); ElMessage.success('已删除'); fetch() } catch {} }
async function handleSubmit() { const v = await formRef.value?.validate().catch(() => false); if (!v) return; submitting.value = true; try { if (isEdit.value) { await updateReader(form.id as number, form); ElMessage.success('修改成功') } else { await createReader(form); ElMessage.success('添加成功') } dialogVisible.value = false; fetch() } finally { submitting.value = false } }
onMounted(fetch)
</script>

<template>
  <div class="page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="搜索"><el-input v-model="keyword" placeholder="姓名 / 编号 / 手机号" clearable @clear="doSearch" @keyup.enter="doSearch" style="width:280px" /></el-form-item>
        <el-form-item>
          <el-button class="btn-primary" @click="doSearch">搜索</el-button>
          <el-button class="btn-secondary" @click="openAdd"><el-icon><Plus /></el-icon>新增读者</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-card">
      <el-table :data="readers" stripe v-loading="loading">
        <el-table-column prop="readerNo" label="编号" width="120" />
        <el-table-column prop="name" label="姓名" width="90"><template #default="{ row }"><span style="font-weight:500">{{ row.name }}</span></template></el-table-column>
        <el-table-column prop="gender" label="性别" width="60" align="center" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="170"><template #default="{ row }"><span style="color:var(--accent);font-size:13px">{{ row.email }}</span></template></el-table-column>
        <el-table-column prop="address" label="地址" min-width="150" />
        <el-table-column label="注册日期" width="110"><template #default="{ row }">{{ row.createdAt?.split('T')[0] }}</template></el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pager-row"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" background small /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="70px">
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item></el-col><el-col :span="12"><el-form-item label="性别"><el-radio-group v-model="form.gender"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group></el-form-item></el-col></el-row>
        <el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱" prop="email"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
      </el-form>
      <template #footer><el-button class="btn-secondary" @click="dialogVisible = false">取消</el-button><el-button class="btn-primary" :loading="submitting" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { max-width: 1300px; }
.pager-row { margin-top: 14px; display: flex; justify-content: flex-end; }
</style>