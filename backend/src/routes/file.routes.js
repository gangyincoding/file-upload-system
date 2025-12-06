import express from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  getFiles,
  getFileById,
  downloadFile,
  updateFile,
  deleteFile,
  getStatistics
} from '../controllers/file.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../config/multer.config.js';

const router = express.Router();

// 所有路由都需要认证
router.use(verifyToken);

// 上传单个文件
router.post('/upload', upload.single('file'), uploadFile);

// 上传多个文件
router.post('/upload-multiple', upload.array('files', 10), uploadMultipleFiles);

// 获取文件列表（带分页和搜索）
router.get('/', getFiles);

// 获取文件统计信息
router.get('/statistics', getStatistics);

// 获取单个文件信息
router.get('/:id', getFileById);

// 下载文件
router.get('/:id/download', downloadFile);

// 更新文件信息
router.put('/:id', updateFile);

// 删除文件
router.delete('/:id', deleteFile);

export default router;
