<p align="center">
  <img src="assets/icon.png" width="128" height="128" alt="EPIDASH">
</p>

<h1 align="center">EPIDASH</h1>

<p align="center">
  <strong>A modern dashboard to view your Epitest results</strong>
</p>

<p align="center">
  <a href="https://github.com/maty-millien/EPIDASH/releases/latest">
    <img src="https://img.shields.io/github/v/release/maty-millien/EPIDASH?style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/maty-millien/EPIDASH/releases">
    <img src="https://img.shields.io/github/downloads/maty-millien/EPIDASH/total?style=flat-square" alt="Downloads">
  </a>
  <a href="https://github.com/maty-millien/EPIDASH/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/maty-millien/EPIDASH?style=flat-square" alt="License">
  </a>
</p>

---

EPIDASH is a desktop application for Epitech students to track their automated test results from the Epitest platform. It provides a clean, fast interface to monitor your project scores, skill breakdowns, and test history.

## Installation

### Quick Install (macOS & Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/maty-millien/EPIDASH/main/install.sh | bash
```

### Manual Download

Download the latest release for your platform from the [Releases](https://github.com/maty-millien/EPIDASH/releases) page:

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | `EPIDASH-darwin-arm64-x.x.x.zip` |
| macOS (Intel) | `EPIDASH-darwin-x64-x.x.x.zip` |
| Linux (Debian/Ubuntu) | `epidash_x.x.x_amd64.deb` |
| Linux (Fedora/RHEL) | `epidash-x.x.x.x86_64.rpm` |
| Windows | `EPIDASH-x.x.x Setup.exe` |

## Features

- **Dashboard Overview** — See all your projects at a glance with pass rates and status indicators
- **Skill Breakdown** — View detailed skill scores for each project
- **Test History** — Track your progress over multiple submissions
- **Auto Updates** — Receive updates automatically when new versions are released
- **Microsoft SSO** — Secure authentication via your Epitech account

## Screenshots

<p align="center">
  <img src="docs/screenshot.png" width="800" alt="EPIDASH Dashboard">
</p>

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun start

# Package the app
bun run package

# Create distributable installers
bun run make
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Electron
- **Build**: Vite, Electron Forge

## License

[MIT](LICENSE)
