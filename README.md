# Telegram News Bot

一个用于监控数据库中新代币初始化事件并通过Telegram发送通知的自动化机器人。

## 功能特性

- 🔍 **实时监控** - 持续监控数据库中的新代币初始化事件
- 📱 **Telegram集成** - 自动发送格式化的通知消息到指定频道
- 🐳 **Docker支持** - 完整的容器化部署方案
- 🔧 **配置灵活** - 通过环境变量轻松配置
- 📊 **完整日志** - 详细的日志记录和错误处理
- 🏥 **健康检查** - 内置健康监控和自动重连机制
- ⚡ **高性能** - 使用连接池和优化的查询策略

## 项目结构

```
telegram_news_bot2/
├── src/
│   ├── services/
│   │   ├── database.ts      # 数据库服务
│   │   └── telegram.ts      # Telegram Bot服务
│   ├── types/
│   │   └── index.ts         # TypeScript类型定义
│   ├── utils/
│   │   ├── config.ts        # 配置管理
│   │   ├── logger.ts        # 日志工具
│   │   ├── errorHandler.ts  # 错误处理
│   │   └── health.ts        # 健康检查
│   └── index.ts             # 主应用程序
├── logs/                    # 日志文件目录
├── Dockerfile              # Docker镜像配置
├── docker-compose.yml      # Docker Compose配置
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
└── README.md               # 项目文档
```

## 快速开始

### 环境准备

- Node.js 18+
- PostgreSQL数据库
- Telegram Bot Token

### 1. 克隆项目

```bash
git clone <repository-url>
cd telegram_news_bot2
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写以下必要配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password

# Telegram Bot配置
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4. 获取Telegram Bot Token

1. 在Telegram中找到 [@BotFather](https://t.me/botfather)
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 获取Bot Token并填入 `.env` 文件

### 5. 获取Chat ID

1. 将机器人添加到目标群组或频道
2. 发送一条消息给机器人
3. 访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. 从响应中找到 `chat.id` 并填入 `.env` 文件

## 运行方式

### 开发模式

```bash
# 编译并监听文件变化
npm run dev

# 或者分别运行
npm run build
npm run watch
```

### 生产模式

```bash
# 编译项目
npm run build

# 启动应用
npm start
```

### Docker部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f telegram-news-bot

# 停止服务
docker-compose down
```

## 监控的数据表

机器人监控名为 `initialize_token_event` 的数据表，包含以下字段：

- `vid` - 唯一标识符（主键）
- `mint` - 代币地址
- `token_name` - 代币名称
- `token_symbol` - 代币符号
- `token_uri` - 代币URI
- `created_at` - 创建时间

## 消息格式

机器人会发送格式化的消息，包含：

```
🚀 新代币初始化

💰 代币名称: [Token Name]
🔤 代币符号: [Symbol]
📍 代币地址: [Mint Address]
🔗 URI: [Token URI]
⏰ 时间: [Timestamp]
```

## 配置选项

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
| `DB_HOST` | 数据库主机 | localhost |
| `DB_PORT` | 数据库端口 | 5432 |
| `DB_NAME` | 数据库名称 | - |
| `DB_USER` | 数据库用户 | - |
| `DB_PASSWORD` | 数据库密码 | - |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | - |
| `TELEGRAM_CHAT_ID` | 目标聊天ID | - |
| `POLL_INTERVAL` | 轮询间隔(毫秒) | 30000 |
| `LOG_LEVEL` | 日志级别 | info |
| `NODE_ENV` | 运行环境 | development |

## 日志

日志文件保存在 `logs/` 目录下：

- `app.log` - 应用日志
- `error.log` - 错误日志

日志级别：`error`, `warn`, `info`, `debug`

## 健康检查

应用包含内置健康检查功能：

- 数据库连接检查
- Telegram Bot连接检查
- 自动重连机制
- 失败重试策略

## 错误处理

- 自动重试机制
- 详细错误日志
- 优雅关闭处理
- 连接断开自动恢复

## 开发信息

### 主要依赖

- `pg` - PostgreSQL客户端
- `node-telegram-bot-api` - Telegram Bot API
- `winston` - 日志库
- `dotenv` - 环境变量管理

### 脚本命令

```bash
npm run build    # 编译TypeScript
npm run start    # 启动应用
npm run dev      # 开发模式
npm run watch    # 监听文件变化
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库配置
   - 确认数据库服务运行状态
   - 验证网络连接

2. **Telegram消息发送失败**
   - 验证Bot Token正确性
   - 确认Chat ID正确
   - 检查机器人权限

3. **找不到新记录**
   - 确认表名和字段名配置
   - 检查数据库权限
   - 验证查询逻辑

### 调试模式

设置环境变量启用详细日志：

```bash
LOG_LEVEL=debug npm run dev
```

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License