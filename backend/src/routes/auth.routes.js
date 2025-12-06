import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// 注册验证规则
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符')
];

// 登录验证规则
const loginValidation = [
  body('username').trim().notEmpty().withMessage('请输入用户名'),
  body('password').notEmpty().withMessage('请输入密码')
];

// 修改密码验证规则
const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('请输入原密码'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少为6个字符')
];

// 公开路由
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// 需要认证的路由
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, changePasswordValidation, changePassword);

export default router;
