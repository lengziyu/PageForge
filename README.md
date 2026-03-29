# PageForge

[中文](./README.md) | [English](./README.en.md)

`PageForge` 是一个面向企业官网场景的开源建站 MVP，重点是：

- 行业模板初始化
- 多页面企业官网生成
- 模块化拖拽编辑
- 站点级公共设置
- 新闻中心与富文本管理

当前版本默认使用 `SQLite + Prisma`，部署门槛更低，不需要单独安装 PostgreSQL。

## 功能概览

- 基于 `Next.js App Router + TypeScript`
- 使用 `Tailwind CSS`
- 使用 `SQLite + Prisma`
- 使用 `Zod` 校验页面 JSON schema
- 使用 `dnd-kit` 做模块拖拽排序
- 每个 block 都包含 `component + defaultProps + zod schema`
- 支持整站发布
- 支持新闻分类、新闻详情、富文本图文视频内容

## 默认页面

模板围绕常见企业官网结构生成独立页面：

- 首页
- 服务与产品
- 技术研发
- 新闻资讯
- 关于我们
- 联系我们

说明：

- `技术研发` 可按需启用
- 每个页面都是独立页面，不是单页锚点

## 本地环境

请先安装：

- Node.js 20+ 或 22 LTS
- npm 10+
- Git

## 环境变量

先复制环境变量文件：

```bash
copy .env.example .env
```

默认示例：

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-password"
```

说明：

- `DATABASE_URL` 默认指向 `prisma/dev.db`
- `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 用于后台登录页
- 如果不设置管理员账号密码，后台登录保护不会启用

## 本地启动

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

启动后访问：

- 官网首页：`http://localhost:3000/`
- 后台入口：`http://localhost:3000/editor`
- 页面编辑：`http://localhost:3000/editor/pages/homepage`
- 新闻中心：`http://localhost:3000/editor/newsroom`

## 前后台访问方式

- `/` 默认进入已发布官网首页
- `/editor` 是后台管理入口
- `/admin/login` 是后台登录页
- `/editor/newsroom` 是新闻后台

只要配置了 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，访问 `/editor` 就会先跳到登录页，登录成功后再进入后台。

## 生产部署

现在默认是 SQLite 方案，部署会简单很多。

生产环境最小流程：

```bash
git clone https://github.com/lengziyu/PageForge.git /opt/apps/PageForge
cd /opt/apps/PageForge
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

如果使用 Nginx 反向代理到 `3000` 端口即可，不需要单独安装 PostgreSQL。

## 推荐部署结构

- `Nginx` 对外提供 `80 / 443`
- `Next.js` 进程跑在 `3000`
- `SQLite` 数据文件保存在 `prisma/dev.db`

这更适合单机部署、演示环境和个人维护的企业官网项目。

## 编辑器流程

1. 打开 `/editor`
2. 选择行业模板
3. 勾选要生成的独立页面
4. 进入页面拖拽编辑
5. 在右侧修改模块设置和公共设置
6. 点击“发布整站”

## 新闻中心

新闻中心当前支持：

- 新闻分类增删改查
- 新闻列表分页
- 草稿 / 发布筛选
- 删除新闻
- 富文本编辑
- 图片和视频插入
- 粘贴带图片或视频的富文本内容

## 项目结构

```text
app/                     Next.js 路由
components/              页面组件与编辑器组件
lib/builder/             搭建器 schema、registry、模板库
lib/news/                新闻中心服务
prisma/                  Prisma schema、seed、SQLite 数据文件
public/                  静态资源
```
