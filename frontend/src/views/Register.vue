<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
};

const registerFormRef = ref(null);

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate();
    loading.value = true;

    const { username, email, password } = registerForm;
    await userStore.register({ username, email, password });

    ElMessage.success('注册成功');
    router.push('/files');
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.response?.data?.message || '注册失败');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="32" color="#409eff"><UserFilled /></el-icon>
          <h2>文件管理系统</h2>
          <p>创建您的账户</p>
        </div>
      </template>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="90px"
        size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="footer">
        <span>已有账户？</span>
        <el-link type="primary" @click="router.push('/login')">
          立即登录
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  padding: var(--apple-spacing-lg);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.register-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 113, 227, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 20s ease-in-out infinite;
}

.register-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 113, 227, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 25s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, 30px);
  }
}

.register-card {
  width: 100%;
  max-width: 480px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-header {
  text-align: center;
  padding: var(--apple-spacing-xl) 0 var(--apple-spacing-lg);
}

.card-header .el-icon {
  margin-bottom: var(--apple-spacing-md);
  opacity: 0.9;
}

.card-header h2 {
  margin: var(--apple-spacing-sm) 0 var(--apple-spacing-xs);
  color: var(--apple-text-primary);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card-header p {
  margin: 0;
  color: var(--apple-text-secondary);
  font-size: 17px;
  font-weight: 400;
}

.footer {
  text-align: center;
  margin-top: var(--apple-spacing-lg);
  color: var(--apple-text-secondary);
  font-size: 15px;
}

.footer span {
  margin-right: var(--apple-spacing-xs);
}

:deep(.el-form-item__label) {
  color: var(--apple-text-primary) !important;
  font-weight: 500;
  font-size: 15px;
}

:deep(.el-input__inner) {
  font-size: 16px;
  color: var(--apple-text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--apple-text-tertiary);
}

:deep(.el-button) {
  margin-top: var(--apple-spacing-sm);
  font-size: 17px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: var(--apple-spacing-md);
  }

  .register-card {
    max-width: 100%;
  }

  .card-header h2 {
    font-size: 28px;
  }

  .card-header p {
    font-size: 15px;
  }

  :deep(.el-form-item__label) {
    width: 80px !important;
  }
}
</style>
