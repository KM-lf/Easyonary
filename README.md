# 📖 Easyonary

A dictionary web app that shows word pronunciation in **readable Latin** — no weird IPA symbols like `/ˈkɜːlɪŋ/`. Just plain, human-readable phonetics like **KUR-ling STOWN**.

Built for people who never understood why dictionaries use symbols nobody can read.

> Powered by Claude · Anthropic

---

## ✨ Features

- 🔊 **Readable pronunciation** — capital letters mark the stressed syllable (e.g. `ih-FEM-er-ul`)
- 📝 **Word meaning, example sentence, and word origin**
- 🎲 **Random word button** to discover new words
- 🕓 **Search history** chips for quick re-lookup
- ⚡ AI-powered — works for any word or phrase, not limited to a fixed database

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- An [Anthropic API key](https://console.anthropic.com/)

### Install & Run

```bash
git clone https://github.com/yourusername/easyonary.git
cd easyonary
npm install
npm run dev
```

### API Key Setup

Create a `.env` file in the root:

```
ANTHROPIC_API_KEY=your_api_key_here
```

> ⚠️ Never expose your API key in the frontend directly. Use a backend or serverless function to keep it safe.

---

## 🛠 Tech Stack

- [React](https://react.dev/)
- [Anthropic Claude API](https://www.anthropic.com/)
- Vanilla CSS-in-JS

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open an issue for bugs or feature ideas
- Submit a pull request
- Improve the phonetic logic or UI

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
