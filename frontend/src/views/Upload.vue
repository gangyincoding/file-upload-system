<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { uploadFile, uploadMultipleFiles } from '../api/file';
import { ElMessage } from 'element-plus';

const router = useRouter();
const fileList = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const description = ref('');
const dropActive = ref(false);

const handleFileSelect = (file) => {
  if (fileList.value.length >= 10) {
    ElMessage.warning('最多只能上传10个文件');
    return false;
  }
  return true;
};

const handleExceed = () => {
  ElMessage.warning('最多只能上传10个文件');
};

const handleRemove = (file) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

const handleDrop = (e) => {
  dropActive.value = false;
  const files = Array.from(e.dataTransfer.files);

  if (fileList.value.length + files.length > 10) {
    ElMessage.warning('最多只能上传10个文件');
    return;
  }

  files.forEach(file => {
    fileList.value.push({
      uid: Date.now() + Math.random(),
      name: file.name,
      raw: file,
      size: file.size
    });
  });
};

const handleDragOver = (e) => {
  e.preventDefault();
  dropActive.value = true;
};

const handleDragLeave = () => {
  dropActive.value = false;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const totalSize = computed(() => {
  return fileList.value.reduce((sum, file) => sum + (file.size || 0), 0);
});

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  try {
    uploading.value = true;
    uploadProgress.value = 0;

    const formData = new FormData();

    if (fileList.value.length === 1) {
      formData.append('file', fileList.value[0].raw);
      formData.append('description', description.value);

      await uploadFile(formData, (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      });
    } else {
      fileList.value.forEach(file => {
        formData.append('files', file.raw);
      });
      formData.append('description', description.value);

      await uploadMultipleFiles(formData, (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      });
    }

    ElMessage.success('文件上传成功');

    // 清空文件列表
    fileList.value = [];
    description.value = '';
    uploadProgress.value = 0;

    // 跳转到文件列表页面
    setTimeout(() => {
      router.push('/files');
    }, 1000);
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '文件上传失败');
  } finally {
    uploading.value = false;
  }
};

const clearFiles = () => {
  fileList.value = [];
  description.value = '';
};
</script>

<template>
  <div class="upload-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>上传文件</span>
          <el-button
            v-if="fileList.length > 0"
            type="danger"
            text
            @click="clearFiles"
          >
            清空列表
          </el-button>
        </div>
      </template>

      <!-- 拖拽上传区域 -->
      <div
        class="drop-zone"
        :class="{ active: dropActive }"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <el-upload
          v-model:file-list="fileList"
          multiple
          :auto-upload="false"
          :limit="10"
          :on-exceed="handleExceed"
          :before-upload="handleFileSelect"
          :on-remove="handleRemove"
          drag
          class="upload-area"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <p class="primary-text">将文件拖到此处，或点击上传</p>
            <p class="secondary-text">支持批量上传，最多10个文件</p>
          </div>
        </el-upload>
      </div>

      <!-- 文件列表 -->
      <div v-if="fileList.length > 0" class="file-list">
        <div class="file-list-header">
          <span>已选择 {{ fileList.length }} 个文件</span>
          <span>总大小: {{ formatFileSize(totalSize) }}</span>
        </div>

        <el-table :data="fileList" stripe>
          <el-table-column prop="name" label="文件名" />
          <el-table-column label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                text
                @click="handleRemove(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 文件描述 -->
      <div class="description-area">
        <el-input
          v-model="description"
          type="textarea"
          :rows="3"
          placeholder="请输入文件描述（可选）"
          maxlength="500"
          show-word-limit
        />
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading" class="progress-area">
        <el-progress
          :percentage="uploadProgress"
          :status="uploadProgress === 100 ? 'success' : undefined"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          :loading="uploading"
          :disabled="fileList.length === 0"
          @click="handleUpload"
        >
          <el-icon><Upload /></el-icon>
          开始上传
        </el-button>
        <el-button
          size="large"
          @click="router.push('/files')"
        >
          返回文件列表
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.upload-container {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
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

.drop-zone {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--apple-radius-large);
}

.drop-zone.active {
  background-color: rgba(0, 113, 227, 0.05);
  border: 2px dashed var(--apple-blue);
}

.upload-area {
  width: 100%;
}

:deep(.el-upload-dragger) {
  padding: 80px 40px;
  border: 2px dashed var(--apple-border);
  border-radius: var(--apple-radius-large);
  background-color: var(--apple-bg-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--apple-blue);
  background-color: rgba(0, 113, 227, 0.03);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 88px;
  color: var(--apple-blue);
  margin-bottom: var(--apple-spacing-lg);
  opacity: 0.9;
}

.upload-text {
  text-align: center;
}

.primary-text {
  font-size: 18px;
  color: var(--apple-text-primary);
  margin: 0 0 var(--apple-spacing-xs);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.secondary-text {
  font-size: 15px;
  color: var(--apple-text-secondary);
  margin: 0;
  font-weight: 400;
}

.file-list {
  margin-top: var(--apple-spacing-xl);
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--apple-spacing-md);
  padding: var(--apple-spacing-md);
  background: linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, rgba(0, 113, 227, 0.03) 100%);
  border-radius: var(--apple-radius-medium);
  font-size: 15px;
  color: var(--apple-text-primary);
  font-weight: 600;
}

:deep(.el-table) {
  border-radius: var(--apple-radius-medium);
  overflow: hidden;
}

.description-area {
  margin-top: var(--apple-spacing-lg);
}

:deep(.el-textarea__inner) {
  border-radius: var(--apple-radius-medium) !important;
  font-size: 15px;
  padding: var(--apple-spacing-md);
  border: 1px solid var(--apple-border);
  transition: all 0.2s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
}

.progress-area {
  margin-top: var(--apple-spacing-lg);
}

:deep(.el-progress__text) {
  font-weight: 600;
  color: var(--apple-blue);
}

.action-buttons {
  margin-top: var(--apple-spacing-xl);
  display: flex;
  gap: var(--apple-spacing-md);
  justify-content: center;
}

.action-buttons .el-button {
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 600;
  min-width: 160px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-upload-dragger) {
    padding: 60px 20px;
  }

  .upload-icon {
    font-size: 72px;
  }

  .primary-text {
    font-size: 16px;
  }

  .secondary-text {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .file-list-header {
    flex-direction: column;
    gap: var(--apple-spacing-xs);
    align-items: flex-start;
  }
}
</style>
