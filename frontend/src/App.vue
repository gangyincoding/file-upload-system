<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

onMounted(() => {
  // 恢复用户信息
  userStore.restoreUser();
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <el-container v-if="userStore.isLoggedIn && route.name !== 'Login' && route.name !== 'Register'">
      <el-header class="header">
        <div class="header-left">
          <h2>文件管理系统</h2>
        </div>
        <el-menu
          :default-active="route.path"
          class="header-menu"
          mode="horizontal"
          :ellipsis="false"
          router
        >
          <el-menu-item index="/files">
            <el-icon><Folder /></el-icon>
            <span>我的文件</span>
          </el-menu-item>
          <el-menu-item index="/upload">
            <el-icon><Upload /></el-icon>
            <span>上传文件</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin">
            <el-icon><Setting /></el-icon>
            <span>管理后台</span>
          </el-menu-item>
        </el-menu>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.username }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 无导航栏的页面（登录、注册） -->
    <router-view v-else />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background-color: var(--apple-bg-light);
}

.el-container {
  min-height: 100vh;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  padding: 0 var(--apple-spacing-lg);
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-left h2 {
  margin: 0;
  color: var(--apple-text-primary);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-menu {
  flex: 1;
  border-bottom: none;
  margin: 0 var(--apple-spacing-xl);
  background: transparent !important;
}

:deep(.el-menu-item) {
  font-size: 15px;
  font-weight: 500;
  color: var(--apple-text-primary) !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 var(--apple-spacing-md);
}

:deep(.el-menu-item:hover) {
  background-color: rgba(0, 113, 227, 0.05) !important;
  color: var(--apple-blue) !important;
}

:deep(.el-menu-item.is-active) {
  color: var(--apple-blue) !important;
  border-bottom-color: var(--apple-blue) !important;
  background-color: transparent !important;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 6px;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--apple-radius-medium);
  transition: all 0.2s ease;
  color: var(--apple-text-primary);
  font-size: 15px;
  font-weight: 500;
}

.user-info:hover {
  background-color: rgba(0, 113, 227, 0.08);
}

:deep(.el-dropdown-menu) {
  border-radius: var(--apple-radius-medium) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  border: none !important;
  padding: var(--apple-spacing-xs) !important;
}

:deep(.el-dropdown-menu__item) {
  border-radius: var(--apple-radius-small) !important;
  padding: 10px 16px !important;
  font-size: 15px;
  color: var(--apple-text-primary);
  transition: all 0.15s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(0, 113, 227, 0.08) !important;
  color: var(--apple-blue);
}

.main-content {
  padding: var(--apple-spacing-xl);
  overflow-y: auto;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
    height: auto;
    padding: var(--apple-spacing-sm);
  }

  .header-left h2 {
    font-size: 18px;
  }

  .header-menu {
    margin: var(--apple-spacing-sm) 0;
    width: 100%;
  }

  :deep(.el-menu-item) {
    padding: 0 var(--apple-spacing-sm);
    font-size: 14px;
  }

  :deep(.el-menu-item span) {
    display: none;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
    margin-top: var(--apple-spacing-sm);
  }

  .main-content {
    padding: var(--apple-spacing-md);
  }
}
</style>
