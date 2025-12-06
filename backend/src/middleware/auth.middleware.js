import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';
import User from '../models/user.model.js';

// 验证 JWT Token
export const verifyToken = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, authConfig.secret);

    // 获取用户信息
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }

    return res.status(500).json({
      success: false,
      message: '认证失败',
      error: error.message
    });
  }
};

// 验证管理员权限
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// 验证用户权限（用户只能操作自己的资源，管理员可以操作所有资源）
export const verifyOwnership = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: '没有权限访问此资源'
      });
    }
  };
};
