# Telegram News Bot

An automated bot for monitoring new token initialization events in the database and sending notifications via Telegram.

## Features

- 🔍 **Real-time Monitoring** - Continuously monitors new token initialization events in the database
- 📱 **Telegram Integration** - Automatically sends formatted notification messages to specified channels
- 🐳 **Docker Support** - Complete containerized deployment solution
- 🔧 **Flexible Configuration** - Easy configuration through environment variables
- 📊 **Comprehensive Logging** - Detailed logging and error handling
- 🏥 **Health Checks** - Built-in health monitoring and automatic reconnection mechanisms
- ⚡ **High Performance** - Uses connection pooling and optimized query strategies

## Project Structure

```
telegram_news_bot2/
├── src/
│   ├── services/
│   │   ├── database.ts      # Database service
│   │   └── telegram.ts      # Telegram Bot service
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── config.ts        # Configuration management
│   │   ├── logger.ts        # Logging utilities
│   │   ├── errorHandler.ts  # Error handling
│   │   └── health.ts        # Health checks
│   └── index.ts             # Main application
├── logs/                    # Log files directory
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Telegram Bot Token

### 1. Clone the Project

```bash
git clone <repository-url>
cd telegram_news_bot2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the environment variable template and fill in the configuration:

```bash
cp .env.example .env
```

Edit the `.env` file and fill in the following required configurations:

```env
# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password

# Telegram Bot configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=your_chat_id_here
```

### 4. Get Telegram Bot Token

1. Find [@BotFather](https://t.me/botfather) in Telegram
2. Send `/newbot` to create a new bot
3. Follow the prompts to set the bot name and username
4. Get the Bot Token and fill it into the `.env` file

### 5. Get Chat ID

#### Single Group Configuration
1. Add the bot to the target group or channel
2. Send a message to the bot
3. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find `chat.id` from the response and fill it into the `.env` file

#### Multiple Groups Configuration
If you need to send messages to multiple groups, you can configure multiple Chat IDs:

1. Repeat the above steps for each target group to get their respective Chat IDs
2. Use comma-separated multiple Chat IDs in the `.env` file:
   ```env
   TELEGRAM_CHAT_IDS=-1001234567890,-1009876543210,-1001122334455
   ```
3. The bot will automatically send messages to all configured groups

**Notes:**
- Chat IDs are usually negative numbers (groups) or positive numbers (private chats)
- Ensure the bot has permission to send messages in all target groups
- If sending to one group fails, it won't affect message sending to other groups

## Running Methods

### Development Mode

```bash
# Compile and watch for file changes
npm run dev

# Or run separately
npm run build
npm run watch
```

### Production Mode

```bash
# Compile the project
npm run build

# Start the application
npm start
```

### Docker Deployment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f telegram-news-bot

# Stop service
docker-compose down
```

## Monitored Database Table

The bot monitors a data table named `initialize_token_event` containing the following fields:

- `vid` - Unique identifier (primary key)
- `mint` - Token address
- `token_name` - Token name
- `token_symbol` - Token symbol
- `token_uri` - Token URI
- `created_at` - Creation time

## Message Format

The bot sends formatted messages containing:

```
🚀 New Token Initialized!

📊 Token Info:
• Name: [Token Name]
• Symbol: [Symbol]
• Mint: [Mint Address]

⛓️ Blockchain Info:
• Block Height: [Block Height]
• Transaction: [Transaction ID]
• Timestamp: [Timestamp]
• Fee Rate: [Fee Rate] SOL
• Admin: [Admin Address]
• Mint Size: [Mint Size]

🔗 Links:
[Social links if available]
```

## Configuration Options

| Environment Variable | Description | Default Value |
|---------------------|-------------|---------------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | - |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | - |
| `TELEGRAM_CHAT_IDS` | Target chat IDs (comma-separated for multiple) | - |
| `POLL_INTERVAL` | Polling interval (milliseconds) | 30000 |
| `LOG_LEVEL` | Log level | info |
| `NODE_ENV` | Runtime environment | development |

## Logging

Log files are saved in the `logs/` directory:

- `app.log` - Application logs
- `error.log` - Error logs

Log levels: `error`, `warn`, `info`, `debug`

## Health Checks

The application includes built-in health check functionality:

- Database connection check
- Telegram Bot connection check
- Automatic reconnection mechanism
- Failure retry strategy

## Error Handling

- Automatic retry mechanism
- Detailed error logging
- Graceful shutdown handling
- Automatic recovery from connection drops

## Development Information

### Main Dependencies

- `pg` - PostgreSQL client
- `node-telegram-bot-api` - Telegram Bot API
- `winston` - Logging library
- `dotenv` - Environment variable management

### Script Commands

```bash
npm run build    # Compile TypeScript
npm run start    # Start application
npm run dev      # Development mode
npm run watch    # Watch for file changes
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database configuration
   - Confirm database service is running
   - Verify network connection

2. **Telegram Message Sending Failed**
   - Verify Bot Token correctness
   - Confirm Chat ID is correct
   - Check bot permissions

3. **No New Records Found**
   - Confirm table name and field name configuration
   - Check database permissions
   - Verify query logic

### Debug Mode

Set environment variable to enable detailed logging:

```bash
LOG_LEVEL=debug npm run dev
```

## Contributing

Issues and Pull Requests are welcome to improve the project.

## License

MIT License