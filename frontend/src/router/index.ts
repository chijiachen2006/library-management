import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '仪表盘', icon: 'Odometer' }
        },
        {
          path: 'books',
          name: 'Books',
          component: () => import('../views/BookManagement.vue'),
          meta: { title: '图书管理', icon: 'Reading' }
        },
        {
          path: 'readers',
          name: 'Readers',
          component: () => import('../views/ReaderManagement.vue'),
          meta: { title: '读者管理', icon: 'User' }
        },
        {
          path: 'borrows',
          name: 'Borrows',
          component: () => import('../views/BorrowManagement.vue'),
          meta: { title: '借阅管理', icon: 'Collection' }
        }
      ]
    }
  ]
})

export default router
