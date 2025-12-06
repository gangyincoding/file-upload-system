# 文件上传管理系统

一个功能完整的文件上传管理系统，支持用户权限控制、文件管理和移动端适配。

## 技术栈

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 身份认证
- Multer 文件上传

### 前端
- Vue 3
- Vite
- Element Plus UI 组件库
- Axios HTTP 客户端
- Vue Router
- Pinia 状态管理

## 功能特性

### 用户权限系统
- 用户注册和登录
- 基于 JWT 的身份认证
- 角色权限控制（管理员、普通用户）

### 文件管理
- 文件上传（支持多文件、拖拽上传）
- 文件下载
- 文件预览
- 文件删除
- 文件搜索和筛选

### 权限控制
- **管理员**：可以上传、删除任何文件，管理所有用户
- **普通用户**：只能增删改查自己上传的文件

### 响应式设计
- 完整的移动端适配
- 支持 PC 和手机端访问

## 目录结构

```
file-upload-system/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── config/   # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中间件
│   │   ├── models/   # 数据模型
│   │   ├── routes/   # 路由
│   │   └── utils/    # 工具函数
│   ├── uploads/      # 文件上传目录
│   └── package.json
│
└── frontend/         # 前端应用
    ├── src/
    │   ├── components/  # 组件
    │   ├── views/    # 页面
    │   ├── router/   # 路由配置
    │   ├── stores/   # 状态管理
    │   ├── api/      # API 接口
    │   └── utils/    # 工具函数
    └── package.json
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7

### 后端启动

```bash
cd backend
npm install
npm run dev
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

## 数据库配置

在 `backend/src/config/db.config.js` 中配置您的 MySQL 数据库连接信息。

## 默认账户

系统初始化后会创建一个默认管理员账户：
- 用户名：admin
- 密码：admin123

**请在生产环境中及时修改默认密码！**

## 开发计划

- [x] 项目初始化
- [ ] 后端 API 开发
- [ ] 前端界面开发
- [ ] 权限系统实现
- [ ] 移动端适配
- [ ] 测试和优化

## License

MIT
