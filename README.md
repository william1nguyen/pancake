# 🥞 Pancake Discord Bot

Pancake Bot is a powerful and easy-to-use Discord bot that integrates with TradingView. It helps you manage alerts, authenticate users, and receive real-time notifications directly in your Discord server.

![Pancake Bot](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExqxRATJj7WIJbB3FmdJAA-GykdJjWnivkw&s)

---

## Features

- Connect to TradingView to create and manage alerts
- User login with cookies
- Real-time alert notifications
- Simple and intuitive command system

---

## Commands

- `/login` – Authenticate with TradingView  
- `/get` or `/list` – Show alert information  
- `/remove` – Remove specific or all alerts  
- `/orbr_alert` – Create ORBR-specific alerts

---

## Getting Started

1. Invite Pancake Bot to your Discord server  
2. Use `/login` to authenticate your TradingView account  
3. Start managing alerts using the commands

---

## Tech Stack

- Fastify  
- Drizzle ORM  
- Discord.js  
- Puppeteer

---

## Developer Setup

- Clone project

```bash
git clone https://github.com/your-repo/pancake-bot
cd pancake-bot
```

- Install package and migrate DB
```bash
pnpm install
pnpm db:migrate
```

---

## License

MIT License
