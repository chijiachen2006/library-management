<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getDashboardStats, getBorrows } from '../api/borrows'
import { getBooks } from '../api/books'
import type { BorrowRecord } from '../api/borrows'
import type { Book } from '../api/books'
import { ElMessage } from 'element-plus'

const statsData = ref({ totalBooks: 0, availableBooks: 0, borrowedBooks: 0, overdueBooks: 0, totalReaders: 0, activeBorrows: 0 })
const recentBooks = ref<Book[]>([])
const recentBorrows = ref<BorrowRecord[]>([])
const overdueDialogVisible = ref(false)
const overdueList = ref<BorrowRecord[]>([])
const remindingId = ref<number | null>(null)
const loaded = ref(false)

const statCards = computed(() => [
  {
    label: '总藏书', value: statsData.value.totalBooks, suffix: '册',
    sub: `在库 ${statsData.value.availableBooks} 册`,
    icon: 'Reading', color: '#5b5fe3', bg: 'rgba(91,95,227,0.04)',
    trend: null, clickable: false
  },
  {
    label: '在借中', value: statsData.value.borrowedBooks, suffix: '册',
    sub: `${statsData.value.activeBorrows} 笔活跃借阅`,
    icon: 'Collection', color: '#d4870a', bg: 'rgba(212,135,10,0.04)',
    trend: null, clickable: false
  },
  {
    label: '读者数', value: statsData.value.totalReaders, suffix: '人',
    sub: '系统运行正常',
    icon: 'User', color: '#1aab6b', bg: 'rgba(26,171,107,0.04)',
    trend: null, clickable: false
  },
  {
    label: '逾期未还', value: statsData.value.overdueBooks, suffix: '册',
    sub: statsData.value.overdueBooks > 0 ? '点击查看详情 →' : '暂无逾期 ✓',
    icon: 'WarningFilled', color: '#e03e3e', bg: 'rgba(224,62,62,0.04)',
    trend: null, clickable: statsData.value.overdueBooks > 0
  },
])

const displayValues = ref([0, 0, 0, 0])

function animateCounts() {
  statCards.value.forEach((card, i) => {
    const target = card.value
    if (target === 0) { displayValues.value[i] = 0; return }
    const duration = 1000
    const start = performance.now()
    function tick(t: number) {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      displayValues.value[i] = Math.round(eased * target)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

async function loadData() {
  try {
    const [statsRes, booksRes, borrowsRes] = await Promise.all([
      getDashboardStats(), getBooks({ pageSize: 5 }), getBorrows({ pageSize: 5 }),
    ])
    statsData.value = statsRes.data
    recentBooks.value = booksRes.data.list
    recentBorrows.value = borrowsRes.data.list
    loaded.value = true
    requestAnimationFrame(() => animateCounts())
  } catch (e) { console.error(e) }
}

async function openOverdue() {
  if (statsData.value.overdueBooks === 0) return
  try {
    const res = await getBorrows({ status: 'overdue', pageSize: 999 })
    overdueList.value = res.data.list
    overdueDialogVisible.value = true
  } catch { ElMessage.error('加载失败') }
}

function remind(r: BorrowRecord) {
  remindingId.value = r.id
  setTimeout(() => {
    remindingId.value = null
    ElMessage({ message: `已提醒 ${r.reader?.name} 归还《${r.book?.title}》`, type: 'success', duration: 2500 })
  }, 700)
}

function daysOverdue(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

function statusTag(s: string) {
  if (s === 'borrowed') return 'warning'
  if (s === 'overdue') return 'danger'
  return 'info'
}
function statusText(s: string) {
  if (s === 'borrowed') return '在借'
  if (s === 'overdue') return '逾期'
  return '已还'
}

onMounted(loadData)
</script>

<template>
  <div class="dashboard">
    <!-- Stats -->
    <div class="stats-grid">
      <div
        v-for="(card, i) in statCards"
        :key="card.label"
        class="stat-card animate-fade-up"
        :class="{ clickable: card.clickable }"
        :style="{ animationDelay: (i * 0.07) + 's' }"
        @click="card.clickable && openOverdue()"
      >
        <div class="stat-top">
          <div class="stat-icon-box" :style="{ background: card.bg }">
            <el-icon :size="18" :color="card.color"><component :is="card.icon" /></el-icon>
          </div>
          <div v-if="card.clickable && card.value > 0" class="stat-badge">
            <span class="badge-dot"></span>
            {{ card.value }}
          </div>
        </div>
        <div class="stat-body">
          <div class="stat-value">
            <span class="stat-num" :style="{ color: card.value > 0 && card.clickable ? card.color : '' }">
              {{ displayValues[i].toLocaleString() }}
            </span>
            <span class="stat-unit">{{ card.suffix }}</span>
          </div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
        <div class="stat-foot">{{ card.sub }}</div>
      </div>
    </div>

    <!-- Tables -->
    <div class="grid-2col">
      <div class="surface-card panel">
        <div class="panel-head">
          <span class="panel-dot" style="background:#5b5fe3"></span>
          <span>最新入库</span>
        </div>
        <el-table :data="recentBooks" stripe size="small" v-loading="!loaded">
          <el-table-column prop="title" label="书名">
            <template #default="{ row }"><span class="link-text">{{ row.title }}</span></template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="140" />
          <el-table-column prop="category" label="分类" width="90">
            <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.category }}</el-tag></template>
          </el-table-column>
          <el-table-column label="日期" width="100">
            <template #default="{ row }">{{ row.createdAt?.split('T')[0] }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div class="surface-card panel">
        <div class="panel-head">
          <span class="panel-dot" style="background:#d4870a"></span>
          <span>最近借阅</span>
        </div>
        <el-table :data="recentBorrows" stripe size="small" v-loading="!loaded">
          <el-table-column label="读者" width="70">
            <template #default="{ row }">{{ row.reader?.name }}</template>
          </el-table-column>
          <el-table-column label="图书">
            <template #default="{ row }">{{ row.book?.title }}</template>
          </el-table-column>
          <el-table-column label="应还" width="100">
            <template #default="{ row }">{{ row.dueDate?.split('T')[0] }}</template>
          </el-table-column>
          <el-table-column label="状态" width="70" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTag(row.status)" size="small" effect="dark">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Overdue dialog -->
    <el-dialog v-model="overdueDialogVisible" width="720px" class="overdue-dialog">
      <template #header>
        <div class="dlg-head">
          <div class="dlg-icon danger"><el-icon :size="18"><WarningFilled /></el-icon></div>
          <div>
            <div class="dlg-title">逾期未还名单</div>
            <div class="dlg-sub">{{ overdueList.length }} 条记录需要处理</div>
          </div>
        </div>
      </template>

      <div class="overdue-list">
        <div v-for="r in overdueList" :key="r.id" class="overdue-row">
          <div class="overdue-left">
            <div class="overdue-avatar">{{ r.reader?.name?.charAt(0) }}</div>
            <div class="overdue-meta">
              <div class="overdue-name">{{ r.reader?.name }} <span class="ov-no">{{ r.reader?.readerNo }}</span></div>
              <div class="overdue-book">《{{ r.book?.title }}》</div>
              <div class="overdue-date">
                应还 {{ r.dueDate?.split('T')[0] }}
                <span class="ov-days">· 逾期 {{ daysOverdue(r.dueDate || '') }} 天</span>
              </div>
            </div>
          </div>
          <el-button
            type="danger" plain size="small" round
            :loading="remindingId === r.id"
            @click="remind(r)"
          >{{ remindingId === r.id ? '发送中' : '催还' }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.dashboard { max-width: 1300px; }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); padding: 22px 24px;
  transition: all 0.25s var(--ease-out); position: relative; overflow: hidden;
  opacity: 0;
}
.stat-card.animate-fade-up { animation: fadeUp 0.5s var(--ease-out) forwards; }
.stat-card.clickable { cursor: pointer; }
.stat-card.clickable:hover { border-color: rgba(224,62,62,0.2); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.stat-icon-box {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.stat-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; color: var(--danger);
  background: var(--danger-subtle); padding: 3px 10px; border-radius: 20px;
}
.badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--danger); animation: pulse-dot 2s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }

.stat-body { margin-bottom: 16px; }
.stat-value { display: flex; align-items: baseline; gap: 6px; }
.stat-num { font-size: 36px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.04em; line-height: 1; }
.stat-unit { font-size: 13px; color: var(--text-tertiary); font-weight: 500; }
.stat-label { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-weight: 500; letter-spacing: 0.01em; text-transform: uppercase; }
.stat-foot { font-size: 12px; color: var(--text-tertiary); padding-top: 12px; border-top: 1px solid var(--border-default); }

/* Panels */
.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.panel { padding: 20px 24px; }
.panel-head { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
.panel-dot { width: 6px; height: 6px; border-radius: 50%; }
.link-text { color: var(--accent); font-weight: 500; cursor: pointer; }

/* Overdue dialog */
.dlg-head { display: flex; align-items: center; gap: 14px; }
.dlg-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.dlg-icon.danger { background: var(--danger-subtle); }
.dlg-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.dlg-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

.overdue-list { display: flex; flex-direction: column; gap: 10px; }
.overdue-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-radius: 12px;
  background: rgba(224,62,62,0.02); border: 1px solid rgba(224,62,62,0.06);
  transition: all 0.15s var(--ease-out);
}
.overdue-row:hover { background: rgba(224,62,62,0.04); border-color: rgba(224,62,62,0.12); }
.overdue-left { display: flex; align-items: center; gap: 14px; }
.overdue-avatar {
  width: 40px; height: 40px; border-radius: 10px; background: rgba(224,62,62,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: var(--danger); flex-shrink: 0;
}
.overdue-name { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.ov-no { font-size: 11px; color: var(--text-tertiary); font-weight: 400; }
.overdue-book { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
.overdue-date { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
.ov-days { color: var(--danger); font-weight: 600; }

@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .grid-2col { grid-template-columns: 1fr; } }
</style>