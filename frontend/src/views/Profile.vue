<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { updateProfile, changePassword } from '../api/auth';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const loading = ref(false);

// 个人信息表单
const profileForm = reactive({
  username: '',
  email: '',
  avatar: ''
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
};

const passwordFormRef = ref(null);

onMounted(() => {
  // 加载用户信息
  if (userStore.user) {
    profileForm.username = userStore.user.username;
    profileForm.email = userStore.user.email;
    profileForm.avatar = userStore.user.avatar || '';
  }
});

const handleUpdateProfile = async () => {
  try {
    loading.value = true;

    await updateProfile(profileForm);
    await userStore.fetchCurrentUser();

    ElMessage.success('个人信息更新成功');
  } catch (error) {
    ElMessage.error('更新失败');
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate();
    loading.value = true;

    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });

    ElMessage.success('密码修改成功');

    // 清空表单
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    passwordFormRef.value.resetFields();
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.response?.data?.message || '密码修改失败');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 个人信息 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </div>
          </template>

          <el-form :model="profileForm" label-width="100px" size="large">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" />
            </el-form-item>

            <el-form-item label="头像URL">
              <el-input v-model="profileForm.avatar" placeholder="头像图片链接" />
            </el-form-item>

            <el-form-item label="用户角色">
              <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'">
                {{ userStore.isAdmin ? '管理员' : '普通用户' }}
              </el-tag>
            </el-form-item>

            <el-form-item label="注册时间">
              <span>{{ new Date(userStore.user?.created_at).toLocaleString('zh-CN') }}</span>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleUpdateProfile"
              >
                更新信息
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 修改密码 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            size="large"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                @keyup.enter="handleChangePassword"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleChangePassword"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.card-header .el-icon {
  font-size: 20px;
}

.el-row {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-form-item__label) {
    width: 90px !important;
  }

  .el-col {
    margin-bottom: 20px;
  }
}
</style>
