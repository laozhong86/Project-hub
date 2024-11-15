# Project Hub - 项目状态监控工具

一个基于 Next.js 开发的项目状态监控工具，可以同时监控项目的本地环境和云端环境的运行状态，并提供可视化的管理界面。

## 主要功能

- 项目环境管理：支持添加和管理多个项目的本地和云端环境
- 状态监控：自动检测各环境的运行状态
- 可视化界面：直观展示项目状态和环境信息
- 实时更新：定期检查并更新项目状态

## 开发环境搭建

### Docker 环境配置

1. 首先拉取基础镜像：
docker pull docker.io/library/node:18-bullseye-slim

2. 启动开发环境：
docker-compose up -d

### 项目结构

project-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── project-hub.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── hooks/
│   │   └── useProjects.ts
│   ├── services/
│   │   ├── storage.ts
│   │   └── status-checker.ts
│   ├── lib/
│   │   └── utils.ts
├── public/
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json

### 可能遇到的问题

1. 如果遇到网络问题，可以配置 Docker 镜像加速：
mkdir -p ~/.docker
cat > ~/.docker/daemon.json << EOF
{
  "registry-mirrors": [
    "https://mirror.baidubce.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF

2. 配置后需要重启 Docker：
- 关闭 Docker Desktop
- 重新启动 Docker Desktop
- 等待 Docker 完全启动

3. 如果构建失败，可以尝试清理 Docker 缓存：
docker system prune -a

### 注意事项

- 确保 Docker Desktop 已经完全启动再执行命令
- 对于 Apple Silicon (M1/M2) Mac 用户，项目已适配 ARM64 架构
- 项目使用了国内镜像源以提高安装速度

#### 容器内开发
- 所有 npm 命令需要在容器内执行
- 本地环境只需要安装 Docker 和编辑器
- 代码变更会自动同步，无需重启容器

#### 依赖管理
- 新增依赖时在容器内执行 npm install
- node_modules 保持在容器内，不要同步到本地

#### 调试方法
- 使用 Next.js 开发服务器的热重载功能
- 容器日志查看：docker logs -f project-hub-web-1

### 开发指南

1. 启动开发环境：

docker-compose up -d
docker exec -it project-hub-web-1 sh
npm install
npm run dev

2. 访问开发服务：
- 本地开发服务器：http://localhost:3002
- 容器内服务器：http://localhost:3000

3. 代码同步：
- 本地代码修改会自动同步到容器
- 容器内会自动热重载

### 开发注意事项

- 本项目使用了浏览器 API (如 localStorage)，部分功能仅在客户端可用
- 使用 next/dynamic 进行动态导入以避免服务器端渲染问题
- 组件导出时需确保正确的导出方式
