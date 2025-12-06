<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getFiles, getStatistics, downloadFile, deleteFile, updateFile } from '../api/file';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const fileList = ref([]);
const statistics = ref({});
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 编辑文件对话框
const editDialogVisible = ref(false);
const editForm = ref({
  id: null,
  original_name: '',
  description: ''
});

onMounted(() => {
  fetchFiles();
  fetchStatistics();
});

const fetchFiles = async () => {
  try {
    loading.value = true;
    const res = await getFiles({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value
    });

    fileList.value = res.data.files;
    total.value = res.data.pagination.total;
  } catch (error) {
    ElMessage.error('获取文件列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const res = await getStatistics();
    statistics.value = res.data;
  } catch (error) {
    console.error('获取统计信息失败:', error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchFiles();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchFiles();
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

const handleDownload = async (file) => {
  try {
    await downloadFile(file.id, file.original_name);
    ElMessage.success('文件下载成功');
  } catch (error) {
    ElMessage.error('文件下载失败');
  }
};

const handleEdit = (file) => {
  editForm.value = {
    id: file.id,
    original_name: file.original_name,
    description: file.description || ''
  };
  editDialogVisible.value = true;
};

const handleEditSubmit = async () => {
  try {
    await updateFile(editForm.value.id, {
      original_name: editForm.value.original_name,
      description: editForm.value.description
    });

    ElMessage.success('文件信息更新成功');
    editDialogVisible.value = false;
    fetchFiles();
  } catch (error) {
    ElMessage.error('更新失败');
  }
};

const handleDelete = async (file) => {
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
    fetchFiles();
    fetchStatistics();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败');
    }
  }
};

const canEdit = (file) => {
  return userStore.isAdmin || file.user_id === userStore.user?.id;
};

const canDelete = (file) => {
  return userStore.isAdmin || file.user_id === userStore.user?.id;
};

const totalFilesFormatted = computed(() => {
  return statistics.value.total_files || 0;
});

const totalSizeFormatted = computed(() => {
  return formatFileSize(statistics.value.total_size || 0);
});
</script>

<template>
  <div class="files-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><Files /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ totalFilesFormatted }}</div>
              <div class="stat-label">文件总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><Folder /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ totalSizeFormatted }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card upload-card">
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            @click="router.push('/upload')"
          >
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 文件列表 -->
    <el-card class="file-list-card">
      <template #header>
        <div class="card-header">
          <span>我的文件</span>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文件名或描述"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="fileList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="original_name" label="文件名" min-width="200" />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="userStore.isAdmin"
          prop="username"
          label="上传者"
          width="120"
        />
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="handleDownload(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="canEdit(row)"
              type="warning"
              size="small"
              text
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canDelete(row)"
              type="danger"
              size="small"
              text
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="fetchFiles"
        />
      </div>
    </el-card>

    <!-- 编辑文件对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑文件信息"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="文件名">
          <el-input v-model="editForm.original_name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.files-container {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
}

.statistics-row {
  margin-bottom: var(--apple-spacing-lg);
}

.stat-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.stat-card:hover {
  transform: translateY(-4px) !important;
}

.stat-card :deep(.el-card__body) {
  padding: var(--apple-spacing-lg);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--apple-spacing-md);
}

.stat-icon {
  font-size: 52px;
  opacity: 0.9;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--apple-text-primary);
  margin-bottom: var(--apple-spacing-xs);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 15px;
  color: var(--apple-text-secondary);
  font-weight: 500;
}

.upload-card :deep(.el-card__body) {
  padding: var(--apple-spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.upload-card .el-button {
  font-size: 17px;
  padding: 16px 32px;
}

.file-list-card {
  margin-top: var(--apple-spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--apple-text-primary);
  letter-spacing: -0.01em;
}

.search-box {
  display: flex;
  gap: var(--apple-spacing-sm);
  max-width: 400px;
}

.search-box .el-input {
  width: 300px;
}

:deep(.el-table) {
  background-color: transparent;
  font-size: 15px;
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--apple-bg-lighter) !important;
  color: var(--apple-text-secondary) !important;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

:deep(.el-table td.el-table__cell) {
  color: var(--apple-text-primary);
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

:deep(.el-table__row:hover) {
  background-color: rgba(0, 113, 227, 0.03) !important;
}

:deep(.el-button--text) {
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--apple-radius-small);
}

:deep(.el-button--text:hover) {
  background-color: rgba(0, 113, 227, 0.08);
}

.pagination {
  margin-top: var(--apple-spacing-lg);
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  font-weight: 500;
}

:deep(.el-pagination button) {
  background-color: transparent;
  border-radius: var(--apple-radius-small);
}

:deep(.el-pager li) {
  border-radius: var(--apple-radius-small);
  font-weight: 500;
}

:deep(.el-pager li.is-active) {
  background-color: var(--apple-blue);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: var(--apple-spacing-md);
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
    max-width: 100%;
  }

  .search-box .el-input {
    flex: 1;
    width: auto;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    font-size: 42px;
  }

  :deep(.el-table__header-wrapper) {
    overflow-x: auto;
  }

  .pagination {
    overflow-x: auto;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
