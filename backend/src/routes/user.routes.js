import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// 所有路由都需要认证和管理员权限
router.use(verifyToken);
router.use(verifyAdmin);

// 获取所有用户列表
router.get('/', getAllUsers);

// 获取单个用户信息
router.get('/:id', getUserById);

// 更新用户信息
router.put('/:id', updateUser);

// 删除用户
router.delete('/:id', deleteUser);

export default router;
