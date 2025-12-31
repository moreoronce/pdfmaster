# PDF Master

一个现代化的 PDF 处理工具，支持在浏览器中本地分割和合并 PDF 文件。

## 功能特性

- **PDF 合并**：将多个 PDF 文件按指定顺序合并为一个文件
- **PDF 分割**：提取特定页面或将文档拆分为多个文件
- **本地处理**：所有操作在浏览器本地完成，保护隐私
- **拖拽排序**：合并时支持拖拽调整文件顺序
- **现代化界面**：使用 React + TypeScript + Tailwind CSS 构建

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **PDF 处理**：pdf-lib (WebAssembly)
- **图标**：Lucide React
- **下载功能**：downloadjs

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
pdf-master/
├── src/
│   ├── components/          # React 组件
│   │   ├── Navbar.tsx       # 导航栏
│   │   ├── LandingPage.tsx  # 首页
│   │   ├── MergePage.tsx    # 合并页面
│   │   ├── SplitPage.tsx    # 分割页面
│   │   └── AdPlaceholder.tsx # 广告占位符
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
├── public/                  # 静态资源
└── package.json             # 项目配置
```

## 核心依赖说明

- `pdf-lib`: 用于 PDF 文件的读取、创建和修改
- `downloadjs`: 处理文件下载
- `lucide-react`: 提供现代化的图标
- `@vitejs/plugin-react`: Vite React 插件，支持 React Compiler

## 浏览器兼容性

支持所有现代浏览器，具有 WebAssembly 支持的浏览器。

## 许可证

© 2024 PDF Master. All rights reserved.
