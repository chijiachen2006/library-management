<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: 'Odometer' },
  { path: '/books', title: '图书管理', icon: 'Reading' },
  { path: '/readers', title: '读者管理', icon: 'User' },
  { path: '/borrows', title: '借阅管理', icon: 'Collection' },
]
</script>

<template>
  <el-container class="layout">
    <!-- Sidebar -->
    <el-aside :width="isCollapse ? '68px' : '232px'" class="aside">
      <div class="sidebar-inner">
        <!-- Logo -->
        <div class="logo-area">
          <div class="logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#5b5fe3"/>
              <path d="M7 9h3l2 6-2-3h3l-2 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <transition name="fade-text">
            <div v-show="!isCollapse" class="logo-text">
              <span class="logo-title">图书管理</span>
              <span class="logo-sub">Library System</span>
            </div>
          </transition>
        </div>

        <!-- Navigation -->
        <nav class="nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ active: activeMenu === item.path }"
          >
            <span class="nav-icon">
              <el-icon :size="18"><component :is="item.icon" /></el-icon>
            </span>
            <transition name="fade-text">
              <span v-show="!isCollapse" class="nav-label">{{ item.title }}</span>
            </transition>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
          <button class="collapse-btn" @click="isCollapse = !isCollapse">
            <el-icon :size="16" class="collapse-icon" :class="{ rotated: isCollapse }">
              <DArrowLeft />
            </el-icon>
          </button>
        </div>
      </div>
    </el-aside>

    <!-- Main -->
    <el-container class="main-area">
      <el-header class="topbar">
        <div class="topbar-inner">
          <div class="topbar-left">
            <span class="topbar-dot"></span>
            <span class="topbar-title">{{ route.meta.title || '仪表盘' }}</span>
          </div>
          <div class="topbar-right">
            <span class="status-indicator"></span>
            <span class="status-text">运行中</span>
          </div>
        </div>
      </el-header>

      <el-main class="content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout { height: 100vh; overflow: hidden; }

/* ===== Sidebar ===== */
.aside {
  background: #0b0d14;
  transition: width 0.3s var(--ease-out);
  overflow: hidden;
  position: relative;
}
.aside::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
}
.sidebar-inner {
  display: flex; flex-direction: column; height: 100%;
  padding: 0 12px;
}

/* Logo */
.logo-area {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 8px 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.logo-mark { flex-shrink: 0; display: flex; align-items: center; }
.logo-text { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
.logo-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.02em; white-space: nowrap; }
.logo-sub { font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.3); letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }

/* Nav */
.nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }
.nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px;
  color: rgba(255,255,255,0.45); text-decoration: none;
  font-size: 13.5px; font-weight: 500; letter-spacing: -0.01em;
  transition: all 0.18s var(--ease-out); position: relative;
}
.nav-link:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
.nav-link.active { color: #fff; background: rgba(255,255,255,0.06); }
.nav-link.active::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 2px; height: 20px; border-radius: 0 2px 2px 0; background: #5b5fe3;
}
.nav-icon { flex-shrink: 0; display: flex; align-items: center; }
.nav-label { white-space: nowrap; }

/* Footer */
.sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.04); }
.collapse-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 6px;
  border: none; background: transparent; color: rgba(255,255,255,0.3);
  cursor: pointer; transition: all 0.15s var(--ease-out);
}
.collapse-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
.collapse-icon { transition: transform 0.3s var(--ease-out); }
.collapse-icon.rotated { transform: rotate(180deg); }

/* ===== Topbar ===== */
.main-area { background: var(--bg-root); }
.topbar {
  height: 56px !important; padding: 0 24px !important;
  display: flex; align-items: center;
  background: rgba(255,255,255,0.7); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-default);
}
.topbar-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.topbar-left { display: flex; align-items: center; gap: 10px; }
.topbar-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
.topbar-title { font-size: 14px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.02em; }
.topbar-right { display: flex; align-items: center; gap: 7px; }
.status-indicator { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
.status-text { font-size: 12px; color: var(--text-tertiary); font-weight: 500; }

/* ===== Content ===== */
.content { padding: 24px; overflow-y: auto; height: calc(100vh - 56px); }

/* ===== Transitions ===== */
.fade-text-enter-active, .fade-text-leave-active { transition: all 0.2s var(--ease-out); }
.fade-text-enter-from, .fade-text-leave-to { opacity: 0; transform: translateX(-6px); }

.page-enter-active { animation: pageIn 0.35s var(--ease-out); }
.page-leave-active { animation: pageOut 0.18s var(--ease-in-out); }

@keyframes pageIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pageOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-6px); }
}
</style>