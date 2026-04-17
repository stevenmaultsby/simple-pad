# Simple-pad - Firefox Extension

[![License](https://img.shields.io/badge/license-MPL--2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/built%20with-react-blue?logo=react)](https://react.dev/)

> 📝 **A minimalist notepad for taking notes about web pages you visit**

**Simple-pad** is a lightweight Firefox extension that lets you quickly jot down notes, thoughts, and reminders about any webpage you're browsing. With clean markdown support and seamless backend synchronization, your notes are always accessible and organized.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📦 Requirements](#-requirements)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [🔨 Building from Source](#-building-from-source)
- [🔐 Privacy & Security](#-privacy--security)
- [🌐 Backend Server](#-backend-server)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📬 Support & FAQ](#-support--faq)

---

## ✨ Features

- 🗒️ **Quick Note-Taking**: Add notes to any webpage with a single click
- 🎨 **Minimalist Light Theme**: Clean, distraction-free interface with a consistent light-only design for optimal readability
- 📝 **Markdown Support**: Format your notes with basic markdown tags:
  - `**bold**` and `*italic*` text
  - `# Headers` and `- lists`
  - `` `code` `` snippets and `[links](url)`
- 🔄 **Auto-Sync**: Notes are automatically saved to your configured backend server
- 🔍 **Page Context**: Notes are linked to the URL you're visiting for easy reference
- 🆓 **100% Free**: No subscriptions, no premium features, no hidden costs
- 🔒 **Privacy-Focused**: No personal data collection, no tracking, no analytics

---

## 📦 Requirements

### Browser Requirements

- Mozilla Firefox **v115+** (Extended Support Release or latest)
- WebExtensions API support

### Development Requirements

| Component | Version |
|-----------|---------|
| Node.js | v18.x or higher |
| npm | v9.x or higher |
| Git | Latest stable |

### Backend Requirements

- Running instance of the [Simple-pad Backend Server](https://github.com/stevenmaultsby/simple-pad_server.git)
- Network access to the backend API endpoint

---

## 🚀 Installation

### Option 1: Install from Mozilla Add-ons (Recommended)

1. Visit the official add-on page:  
   🔗 [Simple-pad on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/simple-pad/)
2. Click **"Add to Firefox"**
3. Confirm the installation when prompted
4. The extension is pre-configured to connect to the official public server. No additional setup required.

### Option 2: Install Pre-Built Distribution (Verified by Mozilla)

This repository includes a Mozilla-verified build of the extension:

1. Download the latest `.xpi` file from the [Releases](https://github.com/stevenmaultsby/simple-pad.git) page
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Select the downloaded `.xpi` file

> ⚠️ Temporary add-ons are disabled when Firefox restarts. For persistent installation, use Option 1 or build from source with your custom server configuration.

---

## ⚙️ Configuration

### Backend Server URL

> ⚠️ **Important**: The backend server address **cannot be changed via the extension's interface**. It is hardcoded at build time using the `.env` file. To connect to a custom server, you must configure `.env` and rebuild the extension.

#### Setting the Server Address

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set the `REACT_APP_SERVER` variable:
   ```env
   REACT_APP_SERVER=https://your-backend-server.com
   ```

3. Build the extension (see [Building from Source](#-building-from-source)). The specified URL will be embedded into the production build.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_SERVER` | Base URL of the backend API server | `http://localhost:8080` | ✅ |

> 💡 Pre-compiled versions (AMO & Releases) are built with the official server URL. Only custom builds allow pointing to your own backend.

---

## 🔨 Building from Source

### Quick Start

```bash
# Clone the repository
git clone https://github.com/stevenmaultsby/simple-pad.git
cd simple-pad

# Install dependencies
npm install

# Configure backend server
cp .env.example .env
# Edit .env and set REACT_APP_SERVER to your backend URL

# Build the extension
npm run build
```
./dist/ directory contains the ready-to-install extension

Load it as a temporary add-on using build/manifest.json

### Project Structure

```
simple-pad/
├── public/                 # Static assets
├── src/
│   ├── components/         # React UI components
│   ├── services/           # API communication layer
│   ├── utils/              # Markdown parser, helpers
│   ├── App.jsx             # Main application component
│   └── manifest.json       # WebExtension manifest
├── .env.example            # Environment variables template
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

---

## 🔐 Privacy & Security

### Our Privacy Commitment

✅ **No Personal Data Collection**: Simple-pad does not collect, store, or transmit any personally identifiable information.

✅ **No Tracking**: We don't track your browsing history, search queries, or online behavior beyond the pages you explicitly choose to annotate.

✅ **No Analytics**: No third-party analytics, telemetry, or crash reporting services are included.

✅ **Open Source**: All code is publicly auditable on GitHub.

✅ **Free Forever**: No premium tiers, no data monetization, no ads.

### What Data Is Stored?

When you create a note, the following information is sent to your configured backend server:

| Data Type | Purpose | Example |
|-----------|---------|---------|
| Page URL | Link notes to the source webpage | `https://example.com/article` |
| Page Title | Display context in your notes list | "Article Title - Example" |
| Note Content | Your markdown-formatted text | `**Important**: Remember to...` |
| Timestamp | Sort and organize notes chronologically | `2026-04-17T10:30:00Z` |

> 🔐 All data is stored on **your** backend server. You control the infrastructure and access policies.

### Security Best Practices

- 🔒 Use HTTPS for your backend server to encrypt data in transit
- 🔑 Keep your `SERVICE_SECRET` (backend) secure and never expose it client-side
- 🔄 Regularly update both the extension and backend server to latest versions
- 🛡️ Review backend server logs for unauthorized access attempts

---

## 🌐 Backend Server

Simple-pad requires a compatible backend server to function. The official server implementation is available here:

🔗 [Simple-pad Backend Server Repository](https://github.com/stevenmaultsby/simple-pad_server.git)

### Server Requirements

- Docker & Docker Compose support
- PostgreSQL database
- Minimum hardware: 2 CPU cores, 8 GB RAM, 40 GB storage

### Quick Backend Setup

```bash
# Clone backend repository
git clone https://github.com/stevenmaultsby/simple-pad_server.git
cd simple-pad_server

# Configure environment
touch .env
# Edit .env with your credentials

# Start services
./run.sh  # or: docker compose up -d --build
```

See the [backend README](https://github.com/stevenmaultsby/simple-pad_server.git) for detailed instructions.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-idea`
3. **Commit** your changes: `git commit -m 'Add: your description'`
4. **Push** to your branch: `git push origin feature/your-idea`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style (ESLint config included)
- Add tests for new functionality
- Update documentation for user-facing changes

### Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](https://github.com/stevenmaultsby/simple-pad/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) in our issue tracker.

---

## 📄 License

This extension is licensed under the **Mozilla Public License 2.0** (MPL-2.0).  
See the [LICENSE](LICENSE) file for the full license text.

> ℹ️ The MPL-2.0 allows you to use, modify, and distribute this software, with the requirement that modifications to MPL-licensed files remain under the same license.

---

## 📬 Support & FAQ

### Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/stevenmaultsby/simple-pad/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/stevenmaultsby/simple-pad/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/stevenmaultsby/simple-pad/wiki)
- ✉️ **Contact**: [stevenmaultsby@runbox.com]

### Frequently Asked Questions

**Q: Where are my notes stored?**  
A: Notes are stored in the PostgreSQL database of the backend server specified during the build process.

**Q: Can I change the server address after installation?**  
A: No. The server URL is hardcoded at build time via the `.env` file. To use a different server, you must update `REACT_APP_SERVER` in `.env` and run `npm run build` to create a new version of the extension.

**Q: Does the extension collect personal data or track my browsing?**  
A: No. The extension only sends note content, page URL, page title, and timestamp to your configured backend server. It does not collect personal information, track behavior, or include analytics.

**Q: Can I use the extension without a backend server?**  
A: No. The extension is designed to sync and store notes on a backend server. A running instance is required for full functionality.

**Q: Is there a dark mode?**  
A: Currently, the extension only supports a clean, minimalist light theme optimized for readability.

---
