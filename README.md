# PageForge

[中文](./README.md) | [English](./README.en.md)

`PageForge` 是一个面向企业官网场景的开源建站 MVP，包含：

- 企业官网模板库
- 模块化拖拽编辑器
- 多页面站点结构
- 草稿 / 发布流程
- 新闻中心与富文本编辑

当前目标不是自由画布，而是先把“企业官网模板 + 可维护的模块编辑器”这条链路做通。

## 项目特性

- 基于 `Next.js App Router + TypeScript`
- 使用 `Tailwind CSS` 构建界面
- 使用 `PostgreSQL + Prisma` 存储页面与新闻数据
- 使用 `Zod` 做页面 JSON schema 校验
- 使用 `dnd-kit` 实现模块拖拽排序
- 每个 block 都具备 `component + defaultProps + zod schema`
- 页面内容统一存储为结构化 JSON

## 适用场景

适合下面这些场景快速起步：

- 企业官网
- SaaS 官网
- 企业服务公司官网
- 制造业官网
- 研发 / 技术平台型官网

当前模板默认覆盖这些标准页面：

- 首页
- 服务与产品
- 技术研发
- 新闻资讯
- 关于我们
- 联系我们

说明：
- `技术研发` 可按需启用
- 每个页面都是独立页面，不是单页锚点

## 当前能力

目前已完成的 MVP 能力：

- 行业模板选择与整站初始化
- 页面列表、新建页面、删除页面
- 模块新增、删除、拖拽排序、折叠
- 右侧属性面板编辑模块内容
- 右侧公共设置编辑站点信息、导航、公共底部
- 整站发布
- 顶部导航与公共底部预览
- 新闻中心
- 新闻分类增删改查
- 新闻富文本编辑
- 图片 / 视频上传插入
- 粘贴富文本图片 / 视频内容

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma
- Zod
- dnd-kit
- wangEditor
- Radix UI

## 本地开发环境

请先安装：

- Node.js 22 LTS
- npm 10+
- PostgreSQL 16+
- Git

推荐本地数据库配置：

1. 创建数据库 `pageforge`
2. 确保 PostgreSQL 监听在 `localhost:5432`
3. 准备一个可连接的数据库账号，例如 `postgres`

## 环境变量

先复制环境变量文件：

```bash
copy .env.example .env
```

默认配置如下：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pageforge?schema=public"
```

如果你的数据库用户名、密码或端口不同，改成你自己的连接串即可。

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

- 编辑器入口：`http://localhost:3000/editor`
- 页面编辑：`http://localhost:3000/editor/pages/homepage`
- 新闻中心：`http://localhost:3000/editor/newsroom`
- 站点预览：`http://localhost:3000/sites/homepage`

## 使用说明

推荐使用流程：

1. 打开 `/editor`
2. 选择行业模板
3. 选择要生成的页面
4. 进入页面编辑器
5. 在左侧添加模块，在中间画布拖拽排序
6. 在右侧编辑模块设置或公共设置
7. 点击“发布整站”

### 模块设置

在右侧 `模块设置` 中可以修改：

- Hero 文案与背景图
- 服务模块内容
- 技术模块内容
- 新闻模块内容
- 联系模块内容
- CTA 模块内容

### 公共设置

在右侧 `公共设置` 中可以修改：

- 站点名称
- 副标题
- Logo
- Favicon
- 导航菜单显示与顺序
- 公共底部样式
- 公司地址、电话、邮箱、备案号、版权文案

## 新闻中心

新闻后台位于：

- `http://localhost:3000/editor/newsroom`

当前支持：

- 创建新闻草稿
- 发布新闻
- 删除新闻
- 新闻分页
- 草稿 / 已发布筛选
- 新闻分类管理
- 富文本正文编辑
- 上传图片 / 视频
- 粘贴图片 / 视频

说明：
- 新闻列表页与新闻详情页共用同一份封面图数据
- 分类被新闻占用时不可删除

## 项目结构

核心目录说明：

```text
app/
  api/                    接口路由
  editor/                 编辑器与新闻后台
  news/                   前台新闻详情页
  sites/                  前台站点页面

components/
  blocks/                 各类模块组件
  builder/                编辑器相关组件
  news/                   新闻后台组件
  site/                   站点壳子（Header / Footer）

lib/
  builder/                页面 schema、block registry、模板库
  news/                   新闻领域逻辑
  prisma.ts               Prisma 客户端

prisma/
  schema.prisma           数据模型
  seed.ts                 初始数据

public/
  hero/                   Hero 背景图
  brand/                  默认品牌资源
```

## 如何交给别人使用

如果你要把这个项目发给别人本地运行：

```bash
git clone <your-repo-url>
cd PageForge
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

对方需要准备：

- Node.js 22
- PostgreSQL
- 一个可用的 `DATABASE_URL`

## 生产部署

推荐部署流程：

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

生产环境变量示例：

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/pageforge?schema=public"
```

推荐部署方式：

- Vercel + Neon / Supabase / PostgreSQL
- 自建 Node.js 服务 + PostgreSQL
- Docker + PostgreSQL

## 开源建议

如果你准备开源，建议至少补上这些内容：

- 开源许可证，例如 `MIT`
- `CONTRIBUTING.md`
- `LICENSE`
- Issue Template / PR Template
- 项目路线图

## 开发原则

本项目当前遵循这些原则：

- 先做 MVP，不做自由画布
- 采用模块化 block / section 架构
- 页面数据使用 JSON schema 存储
- 优先保证结构正确，再优化视觉
- 避免大而乱的单文件
- 每次只推进一个明确子模块

## License

当前仓库还没有单独添加许可证文件。若你准备正式开源，建议补充 `MIT` 或 `Apache-2.0`。
