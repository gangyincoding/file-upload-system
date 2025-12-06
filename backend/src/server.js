import app from './app.js';
import dotenv from 'dotenv';
import { testConnection, initDatabase } from './config/db.config.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    // 初始化数据库表
    await initDatabase();

    // 启动 Express 服务器
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`🚀 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 健康检查: http://localhost:${PORT}/health`);
      console.log('🚀 ========================================');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('👋 收到 SIGTERM 信号，准备关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 收到 SIGINT 信号，准备关闭服务器...');
  process.exit(0);
});
