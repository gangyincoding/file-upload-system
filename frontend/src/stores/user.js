import { defineStore } from 'pinia';
import { login, register, getCurrentUser } from '../api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoggedIn: !!localStorage.getItem('token')
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    username: (state) => state.user?.username || '',
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    // 登录
    async login(credentials) {
      try {
        const res = await login(credentials);
        this.token = res.data.token;
        this.user = res.data.user;
        this.isLoggedIn = true;

        // 保存到localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        return res;
      } catch (error) {
        throw error;
      }
    },

    // 注册
    async register(userData) {
      try {
        const res = await register(userData);
        this.token = res.data.token;
        this.user = res.data.user;
        this.isLoggedIn = true;

        // 保存到localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        return res;
      } catch (error) {
        throw error;
      }
    },

    // 获取当前用户信息
    async fetchCurrentUser() {
      try {
        const res = await getCurrentUser();
        this.user = res.data;
        localStorage.setItem('user', JSON.stringify(res.data));
        return res;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    // 登出
    logout() {
      this.user = null;
      this.token = null;
      this.isLoggedIn = false;

      // 清除localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // 从localStorage恢复用户信息
    restoreUser() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          this.token = token;
          this.user = JSON.parse(userStr);
          this.isLoggedIn = true;
        } catch (error) {
          console.error('恢复用户信息失败:', error);
          this.logout();
        }
      }
    }
  }
});
