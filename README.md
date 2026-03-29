# PageForge

[中文](./README.md) | [English](./README.en.md)

`PageForge` 是一个面向企业官网场景的开源建站 MVP，核心能力是：

- 行业模板初始化
- 多页面企业官网生成
- 模块化拖拽编辑
- 站点级公共设置
- 新闻中心与富文本内容管理

当前目标不是自由画布，而是先把“企业官网模板 + 模块化编辑器”这条链路做通。

## 功能概览

- 基于 `Next.js App Router + TypeScript`
- 使用 `Tailwind CSS` 构建界面
- 使用 `PostgreSQL + Prisma` 存储页面与新闻数据
- 使用 `Zod` 校验页面 JSON schema
- 使用 `dnd-kit` 实现模块拖拽排序
- 每个 block 都包含 `component + defaultProps + zod schema`
- 支持站点级发布，不是单页单独发布
- 支持新闻分类管理、新闻详情页、富文本编辑

## 默认页面结构

模板默认围绕企业官网常见结构生成独立页面：

- 首页
- 服务与产品
- 技术研发
- 新闻资讯
- 关于我们
- 联系我们

说明：

- `技术研发` 可按需启用
- 每个页面都是独立页面，不是单页锚点

## 本地环境要求

请先安装：

- Node.js 22 LTS
- npm 10+
- PostgreSQL 16+
- Git

## 环境变量

先复制环境变量文件：

```bash
copy .env.example .env
```

默认示例：

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/pageforge?schema=public"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-password"
```

说明：

- `DATABASE_URL` 用于连接 PostgreSQL
- `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 用于保护后台管理入口
- 如果不填写管理员账号密码，后台不会启用基础认证保护

## 本地启动

在项目根目录执行：

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

启动后访问：

- 站点首页：`http://localhost:3000/`
- 页面管理：`http://localhost:3000/editor`
- 页面编辑：`http://localhost:3000/editor/pages/homepage`
- 新闻中心：`http://localhost:3000/editor/newsroom`

## 访问路径说明

为了更符合真实企业官网部署方式，项目已经做了前后台分离：

- `/` 默认跳转到已发布首页，也就是 `/sites/homepage`
- `/editor` 是管理后台
- `/editor/newsroom` 是新闻后台

这意味着：

- 访客访问 `https://你的域名`，看到的是官网首页
- 管理人员访问 `https://你的域名/editor`，进入后台

## 如何避免访客看到配置页

项目内已经提供一层基础保护：

- 根域名 `/` 不再显示编辑入口，而是直接进入已发布首页
- 只要配置了 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，访问 `/editor` 和相关管理 API 时就会触发基础认证

适合当前 MVP 的上线方式：

1. 根域名直接提供公开官网访问
2. 管理人员使用 `/editor` 进入后台
3. 通过 Basic Auth 做第一层权限保护

如果后续要正式商用，建议继续升级为：

- 账号登录系统
- Session / JWT 鉴权
- 管理员角色权限
- 上传文件改为对象存储

## 生产部署

常见部署方式：

- `Vercel + Neon / Supabase / PostgreSQL`
- 自建 `Node.js + PostgreSQL`
- `Docker + PostgreSQL`

生产环境部署步骤通常是：

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

同时在生产环境配置：

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## 编辑器使用流程

推荐使用方式：

1. 打开 `/editor`
2. 选择行业模板
3. 勾选要生成的独立页面
4. 进入某个页面开始拖拽编辑
5. 在右侧修改模块设置或公共设置
6. 完成后点击“发布整站”

## 新闻中心

新闻中心当前支持：

- 新闻分类增删改查
- 新闻列表分页
- 草稿 / 发布筛选
- 删除新闻
- 富文本正文编辑
- 插入图片和视频
- 粘贴带图片或视频的富文本内容

## 项目结构

```text
app/                     Next.js 路由
components/              页面组件与编辑器组件
lib/builder/             页面搭建器 schema、registry、模板库
lib/news/                新闻中心服务
prisma/                  Prisma schema 与 seed
public/                  静态资源
```

## 开源建议

如果你准备把它作为开源项目发布，建议同时补上：

- `LICENSE`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- GitHub Issue / PR 模板

