# 文件上传管理系统 - 使用说明

## 项目概述

这是一个功能完整的文件上传管理系统，包含前端和后端，支持用户权限控制和移动端适配。

## 技术栈

### 后端
- **Node.js** + **Express** - 服务器框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **Multer** - 文件上传
- **bcryptjs** - 密码加密

### 前端
- **Vue 3** - 渐进式框架
- **Vite** - 构建工具
- **Element Plus** - UI组件库
- **Axios** - HTTP客户端
- **Vue Router** - 路由管理
- **Pinia** - 状态管理

## 功能特性

### 用户系统
- ✅ 用户注册和登录
- ✅ JWT身份认证
- ✅ 角色权限控制（管理员、普通用户）
- ✅ 个人信息管理
- ✅ 密码修改

### 文件管理
- ✅ 单文件/多文件上传
- ✅ 拖拽上传
- ✅ 上传进度显示
- ✅ 文件列表展示
- ✅ 文件搜索
- ✅ 文件下载
- ✅ 文件编辑（重命名、描述）
- ✅ 文件删除

### 权限控制
- ✅ **管理员**：可以上传、删除任何文件，管理所有用户
- ✅ **普通用户**：只能增删改查自己上传的文件

### 响应式设计
- ✅ 完整的PC端界面
- ✅ 移动端适配
- ✅ 响应式布局

## 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **MySQL** >= 5.7 或 >= 8.0
- **npm** 或 **yarn**

### 1. 数据库配置

#### 创建数据库

```sql
CREATE DATABASE file_upload_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 配置数据库连接

编辑 `backend/.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=file_upload_system

# JWT配置（建议修改为随机字符串）
JWT_SECRET=your_jwt_secret_key_change_in_production
```

**注意**：数据库表会在服务器首次启动时自动创建。

### 2. 启动后端服务

```bash
# 进入后端目录
cd file-upload-system/backend

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev

# 或者启动生产服务器
npm start
```

后端服务器将运行在 `http://localhost:3000`

### 3. 启动前端服务

打开新的终端窗口：

```bash
# 进入前端目录
cd file-upload-system/frontend

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 `http://localhost:5173`

### 4. 访问应用

在浏览器中打开 `http://localhost:5173`

## 使用指南

### 注册账户

1. 点击"立即注册"
2. 填写用户名、邮箱和密码
3. 点击"注册"按钮

### 登录系统

1. 输入用户名和密码
2. 点击"登录"按钮

### 上传文件

1. 登录后点击导航栏的"上传文件"
2. 拖拽文件到上传区域，或点击选择文件
3. 可选：添加文件描述
4. 点击"开始上传"

### 管理文件

在"我的文件"页面可以：
- 查看所有上传的文件
- 搜索文件
- 下载文件
- 编辑文件信息
- 删除文件

### 管理后台（仅管理员）

管理员用户可以访问"管理后台"：
- **用户管理**：查看、删除用户
- **文件管理**：查看、删除所有用户的文件

## API接口文档

### 认证接口

#### 注册
- **POST** `/api/auth/register`
- Body: `{ username, email, password }`

#### 登录
- **POST** `/api/auth/login`
- Body: `{ username, password }`

#### 获取当前用户信息
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

### 文件接口

#### 上传单个文件
- **POST** `/api/files/upload`
- Headers: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data`
- Body: `file`, `description` (可选)

#### 上传多个文件
- **POST** `/api/files/upload-multiple`
- Headers: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data`
- Body: `files[]`, `description` (可选)

#### 获取文件列表
- **GET** `/api/files?page=1&limit=10&search=关键词`
- Headers: `Authorization: Bearer <token>`

#### 下载文件
- **GET** `/api/files/:id/download`
- Headers: `Authorization: Bearer <token>`

#### 删除文件
- **DELETE** `/api/files/:id`
- Headers: `Authorization: Bearer <token>`

### 用户管理接口（仅管理员）

#### 获取所有用户
- **GET** `/api/users?page=1&limit=10`
- Headers: `Authorization: Bearer <token>`

#### 删除用户
- **DELETE** `/api/users/:id`
- Headers: `Authorization: Bearer <token>`

## 权限说明

### 管理员权限
- 查看所有用户上传的文件
- 删除任何文件
- 删除普通用户账户
- 查看用户列表

### 普通用户权限
- 上传文件
- 查看自己的文件列表
- 下载自己的文件
- 编辑自己的文件信息
- 删除自己的文件

## 创建管理员账户

系统默认注册的账户都是普通用户。要创建管理员账户，需要直接修改数据库：

```sql
-- 将用户ID为1的用户设置为管理员
UPDATE users SET role = 'admin' WHERE id = 1;

-- 或者按用户名设置
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

## 移动端访问

系统已完全适配移动端，可以在手机浏览器中访问：

1. 确保手机和电脑在同一局域网
2. 获取电脑的IP地址（如 192.168.1.100）
3. 在手机浏览器中访问 `http://192.168.1.100:5173`

**注意**：需要修改前端 `.env` 文件中的 API 地址：

```env
VITE_API_BASE_URL=http://192.168.1.100:3000/api
```

## 生产环境部署

### 构建前端

```bash
cd frontend
npm run build
```

构建后的文件在 `frontend/dist` 目录。

### 配置生产环境

1. 修改后端 `.env` 文件：
```env
NODE_ENV=production
PORT=3000
```

2. 使用 PM2 管理 Node.js 进程：
```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name file-upload-api
```

3. 使用 Nginx 部署前端并反向代理后端

## 常见问题

### Q: 数据库连接失败？
A: 检查 MySQL 是否正在运行，以及 `.env` 文件中的数据库配置是否正确。

### Q: 文件上传失败？
A: 检查 `backend/uploads` 目录是否有写入权限。

### Q: 前端无法连接后端？
A: 确认后端服务器正在运行，并检查前端 `.env` 文件中的 API 地址。

### Q: 如何修改文件上传大小限制？
A: 修改 `backend/.env` 文件中的 `MAX_FILE_SIZE`（单位：字节，默认10MB）。

### Q: 如何更改端口？
A:
- 后端：修改 `backend/.env` 中的 `PORT`
- 前端：修改 `frontend/vite.config.js` 中的 `server.port`

## 项目结构

```
file-upload-system/
├── backend/                # 后端服务
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── app.js         # Express应用
│   │   └── server.js      # 服务器入口
│   ├── uploads/           # 文件上传目录
│   ├── .env              # 环境变量
│   └── package.json
│
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── api/          # API接口
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── router/       # 路由
│   │   ├── stores/       # 状态管理
│   │   ├── utils/        # 工具函数
│   │   ├── App.vue       # 根组件
│   │   └── main.js       # 入口文件
│   ├── .env              # 环境变量
│   └── package.json
│
└── README.md             # 项目说明
```

## 技术支持

如有问题，请查看：
- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [Express 文档](https://expressjs.com/)

## License

MIT
