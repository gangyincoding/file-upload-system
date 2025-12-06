<script setup>
import { ref, onMounted } from 'vue';
import { getAllUsers, deleteUser } from '../api/user';
import { getFiles, deleteFile } from '../api/file';
import { ElMessage, ElMessageBox } from 'element-plus';

const activeTab = ref('users');
const loading = ref(false);

// 用户管理
const userList = ref([]);
const userPage = ref(1);
const userPageSize = ref(10);
const userTotal = ref(0);

// 文件管理
const fileList = ref([]);
const fileSearch = ref('');
const filePage = ref(1);
const filePageSize = ref(10);
const fileTotal = ref(0);

onMounted(() => {
  fetchUsers();
  fetchAllFiles();
});

// 用户管理功能
const fetchUsers = async () => {
  try {
    loading.value = true;
    const res = await getAllUsers({
      page: userPage.value,
      limit: userPageSize.value
    });

    userList.value = res.data.users;
    userTotal.value = res.data.pagination.total;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleUserPageChange = (page) => {
  userPage.value = page;
  fetchUsers();
};

const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？删除用户将同时删除该用户的所有文件。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    );

    await deleteUser(user.id);
    ElMessage.success('用户删除成功');
    fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('用户删除失败');
    }
  }
};

// 文件管理功能
const fetchAllFiles = async () => {
  try {
    loading.value = true;
    const res = await getFiles({
      page: filePage.value,
      limit: filePageSize.value,
      search: fileSearch.value
    });

    fileList.value = res.data.files;
    fileTotal.value = res.data.pagination.total;
  } catch (error) {
    ElMessage.error('获取文件列表失败');
  } finally {
    loading.value = false;
  }
};

const handleFileSearch = () => {
  filePage.value = 1;
  fetchAllFiles();
};

const handleFilePageChange = (page) => {
  filePage.value = page;
  fetchAllFiles();
};

const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.original_name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await deleteFile(file.id);
    ElMessage.success('文件删除成功');
    fetchAllFiles();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败');
    }
  }
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const getRoleType = (role) => {
  return role === 'admin' ? 'danger' : 'primary';
};

const getRoleText = (role) => {
  return role === 'admin' ? '管理员' : '普通用户';
};
</script>

<template>
  <div class="admin-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>管理后台</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="tab-content">
            <el-table
              v-loading="loading"
              :data="userList"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" min-width="120" />
              <el-table-column prop="email" label="邮箱" min-width="180" />
              <el-table-column label="角色" width="120">
                <template #default="{ row }">
                  <el-tag :type="getRoleType(row.role)">
                    {{ getRoleText(row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="注册时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.role !== 'admin'"
                    type="danger"
                    size="small"
                    text
                    @click="handleDeleteUser(row)"
                  >
                    删除
                  </el-button>
                  <el-tag v-else type="info" size="small">管理员</el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="userPage"
                v-model:page-size="userPageSize"
                :total="userTotal"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleUserPageChange"
                @size-change="fetchUsers"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 文件管理 -->
        <el-tab-pane label="文件管理" name="files">
          <div class="tab-content">
            <div class="search-bar">
              <el-input
                v-model="fileSearch"
                placeholder="搜索文件名、描述或上传者"
                clearable
                @keyup.enter="handleFileSearch"
                @clear="handleFileSearch"
                style="max-width: 400px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleFileSearch">
                搜索
              </el-button>
            </div>

            <el-table
              v-loading="loading"
              :data="fileList"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="original_name" label="文件名" min-width="200" />
              <el-table-column label="大小" width="120">
                <template #default="{ row }">
                  {{ formatFileSize(row.file_size) }}
                </template>
              </el-table-column>
              <el-table-column prop="username" label="上传者" width="120" />
              <el-table-column label="上传时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="handleDeleteFile(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="filePage"
                v-model:page-size="filePageSize"
                :total="fileTotal"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleFilePageChange"
                @size-change="fetchAllFiles"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1400px;
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

.tab-content {
  padding: 20px 0;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }

  .search-bar .el-input {
    max-width: 100% !important;
  }

  .search-bar .el-button {
    width: 100%;
  }

  .pagination {
    overflow-x: auto;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  :deep(.el-table__header-wrapper) {
    overflow-x: auto;
  }
}
</style>
