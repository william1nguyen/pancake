# 🥞 Pancake Discord Bot 🚀

**Pancake Bot** is a powerful and user-friendly Discord bot designed to seamlessly integrate with **TradingView** to manage and set alerts directly from your Discord server. With an intuitive command system, Pancake simplifies alert monitoring, user authentication, and service control.

![Pancake Bot](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExqxRATJj7WIJbB3FmdJAA-GykdJjWnivkw&s)

---

## ✨ **Features**

- **TradingView Integration:** Effortlessly set and manage alerts via TradingView.
- **User Authentication:** Securely store and manage user sessions with cookies.
- **Real-time Updates:** Stay informed with up-to-date alerts and notifications.
- **User-Friendly Commands:** Simple commands to manage alerts and retrieve information.

---

## 📋 **Commands**

### 🛠 **Authentication**

- **`/login`**: 🔑 Authenticate and store user cookies. Connect the user with a channel webhook.

### 📊 **Alert Management**

- **`/get` | `/list`**: 📋 Retrieve and display TradingView alert information.
- **`/remove`**: 🗑 Remove specific alerts or all alerts.
- **`/orbr_alert`**: ⚠️ Set ORBR-specific alerts.

### 🔄 **Workflow**

1. **Login:** Start with `/login` to authenticate your session.
2. **Manage Alerts:** Use `/get`, `/list`, `/remove`, or `/orbr_alert` to interact with alerts.

---

## ⚙️ **How It Works**

1. **User Authentication:** Use `/login` to store your cookies and link your Discord user to TradingView.
2. **Alert Retrieval:** Fetch alert details with `/get` or `/list`.
3. **Manage Alerts:** Add or remove alerts with `/remove` and `/orbr_alert`.
4. **Notification Workflow:** Stay updated with timely notifications.

---

## 📥 **Installation**

1. **Invite Pancake Bot** to your Discord server.
2. **Login** with `/login` to set up your authentication.
3. **Start Managing Alerts** with the provided commands.

---

## 💡 **Examples**

- **Login to Pancake Bot:** `/login`
- **Get Alert Information:** `/get alertID`
- **List All Alerts:** `/list`
- **Remove an Alert:** `/remove alertID`
- **Set ORBR Alert:** `/orbr_alert`

---

## 🛠 **Technologies Used**

- **Fastify:** ⚡ High-performance backend framework.
- **Drizzle ORM:** 💾 Type-safe and lightweight ORM.
- **Discord.js:** 🤖 Library for interacting with Discord API.
- **Puppeteer:** 📸 Headless browser automation for advanced tasks.

---

## 🤝 **Contributing**

Contributions are welcome! Open an issue or submit a pull request to improve Pancake Bot.

---

### 🔔 **Notes**

- Ensure the bot has permissions to manage messages and execute commands.
- Configure webhook connections properly during login.

---

## 📄 **License**

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

Happy Trading with **Pancake Bot**! 🥞🎉
