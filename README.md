# MoeChain Web3 新闻推送服务

基于 Bun + TypeScript 的新闻推送服务，支持从多种新闻源获取新闻并通过 MoePush 进行推送。

## 功能

- 支持从多种新闻源获取新闻
- 使用 MoePush (https://moepush.app) 进行新闻推送
- 可扩展的架构，方便添加更多新闻源
- 支持部署到 VPS 或 Cloudflare Workers 运行
- 支持使用Docker容器部署

## 支持的新闻源
- BlockBeats 快讯
- PANews 快讯
- 方程式新闻（BWE）

## 预览图
![terminal](https://pic.otaku.ren/20250510/AgAD2xkAAjOK-FQ.png)
![dingding](https://pic.otaku.ren/20250510/AgADmBkAAjOK-FQ.png)

## 准备工作

### 获取 MoePush 推送URL

1. 访问 [MoePush官网](https://moepush.app) 注册账号
2. 创建一个新的推送通道
3. 获取推送URL (格式为 `https://moepush.app/api/push/{ID}`)
4. 在配置文件中使用该 URL

## 安装

```bash
git clone https://github.com/MoeChainTools/moechain-web3-news
cd moechain-web3-news

bun install
```

## 本地环境

### 配置

在项目根目录创建 `.env` 文件，参考以下内容进行配置：

```
# MoePush 配置
MOEPUSH_URL=https://moepush.app/api/push/{ID}

# 新闻源配置
POLL_INTERVAL=10 # 轮询间隔（秒）

# 日志配置
LOG_LEVEL=info # 可选值: trace, debug, info, warn, error, silent
```

### 开发

```bash
# 开发模式（监视文件变化）
bun run dev
```

### 部署

```bash
# 使用 PM2 启动服务
bun run start
```

### 构建二进制文件

```bash
# 构建 Linux 版本
bun run build:linux

# 构建 macOS 版本
bun run build:mac

# 构建 Windows 版本
bun run build:win
```

### Docker部署

#### 使用预构建的镜像

```bash
# 拉取最新的Docker镜像
docker pull beilunyang/moechain-web3-news:latest

# 运行Docker容器
docker run -d \
  -e POLL_INTERVAL=10 \
  -e MOEPUSH_URL=https://moepush.app/api/push/{ID} \
  -v /path/to/data:/app \
  --name moechain-web3-news \
  MoeChainTools/moechain-web3-news:latest
```

#### 环境变量

Docker镜像支持以下环境变量：

- `POLL_INTERVAL`: 轮询间隔（秒），默认为10
- `MOEPUSH_URL`: MoePush推送URL

#### 持久化存储

容器使用 `/app` 卷存储数据。为保证数据持久化，建议挂载本地目录到该卷：

```bash
-v /path/to/data:/app
```

这将会将数据库文件保存在宿主机的 `/path/to/data` 目录中，避免容器重启导致数据丢失。

### 存储

服务使用 Bun 内置的 SQLite 功能存储已处理的新闻 ID，避免重复推送。数据库文件保存在 `news.db`，包含以下表：

- `processed_news` 表：存储已处理的新闻 ID
  - `id`: 新闻唯一标识

### 特点

- 使用 SQLite 存储处理过的新闻 ID
- 支持长时间运行的服务
- 通过轮询定期获取新闻

## Cloudflare Workers 环境

### 配置

1. 复制 `wrangler.example.json` 为 `wrangler.json`
2. 配置 KV 命名空间
   ```bash
   # 创建 KV 命名空间
   wrangler kv:namespace create MOECHAIN_WEB3_NEWS_KV
   ```
3. 更新 `wrangler.json` 配置：
   ```json
   {
     "name": "moechain-web3-news",
     "main": "src/worker.ts",
     "compatibility_date": "2025-05-05",
     "compatibility_flags": ["nodejs_compat"],
     "triggers": {
       "crons": ["*/1 * * * *"]  // 每1分钟执行一次
     },
     "kv_namespaces": [
       {
         "binding": "MOECHAIN_WEB3_NEWS_KV",
         "id": "您的KV命名空间ID"
       }
     ],
     "vars": {
       "MOEPUSH_URL": "https://moepush.app/api/push/{ID}",
       "LOG_LEVEL": "info"
     }
   }
   ```

### 开发

```bash
# Cloudflare Worker 开发模式
bun run dev:worker
```

### 部署

```bash
# 部署到 Cloudflare Worker
bun run deploy:worker
```

### 存储与限制

- 使用 KV 存储处理过的新闻 ID
  - `MOECHAIN_WEB3_NEWS_KV`: KV 命名空间，存储新闻 ID 和处理时间
  - 数据会在 7 天后自动过期
- 以无服务器方式运行
- 通过 Cron 触发器定期执行
- 每次执行时限为 30 秒（Cloudflare Workers 限制）

## 添加新的新闻源

1. 在 `src/adapters` 目录下创建新的适配器（如果需要）
2. 在 `src/sources` 目录下创建新的新闻源类，继承 `BaseNewsSource`
3. 在 `src/services/news.ts` 中的 `sources` 数组中添加新的新闻源实例

## 许可证

MIT 