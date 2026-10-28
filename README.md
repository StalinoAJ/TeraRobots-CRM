# TeraRobots CRM 🤖💼

<div align="center">

![TeraRobots CRM](https://img.shields.io/badge/TeraRobots-CRM-0ea5e9?style=for-the-badge&logo=robot&logoColor=white)
![Tauri v2](https://img.shields.io/badge/Tauri_v2-Native_Desktop-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584?style=for-the-badge&logo=rust&logoColor=black)
![React 19](https://img.shields.io/badge/React_19-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <strong>High-performance, offline-first desktop CRM software built specifically for TeraRobots.</strong><br>
  Engineered with Tauri v2, Rust, React 19, and Tailwind CSS with dynamic metadata schemas, Kanban pipeline tracking, and native Indian Rupee (INR ₹) financial reporting.
</p>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Rust Backend & IPC Commands](#-rust-backend--ipc-commands)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Web Dev Mode](#1-web-development-mode)
  - [Native Desktop Mode](#2-native-tauri-desktop-mode)
  - [Production Build](#3-production-standalone-build)
- [Troubleshooting & Linux Notes](#-troubleshooting--linux-notes)
- [Author & Credits](#-author--credits)
- [License](#-license)

---

## 🌟 Overview

**TeraRobots CRM** is an ultra-fast, local-first CRM desktop suite designed to manage robotics enterprise client lifecycles, robotics hardware sales pipelines, hardware deployment tasks, contacts, and opportunities.

Inspired by dynamic metadata systems like [Twenty](https://github.com/twentyhq/twenty) and crafted for extreme performance using **Tauri v2 and Rust**, it provides enterprise CRM capabilities with a lean **~30MB–60MB RAM footprint**, instant startup, zero cloud lock-in, and native INR (`₹`) financial calculations.

---

## ✨ Key Features

### 1. 🧬 Dynamic Workspace Metadata Engine
- **Standard Objects**: Out-of-the-box support for `Company`, `Person`, `Opportunity`, `Task`, and `Note`.
- **Runtime Custom Objects**: Add new custom entity types dynamically on the fly (e.g., `Robot Fleet`, `Maintenance Ticket`, `Hardware Inventory`) without rebuilding or restarting the app.
- **Dynamic Custom Fields**: Attach custom attributes to any object with rich data types:
  - `TEXT`, `NUMBER`, `CURRENCY (INR ₹)`
  - `SELECT`, `MULTI_SELECT`, `BOOLEAN`
  - `DATE_TIME`, `RATING`, `LINKS`, and `RELATION`
- **Native INR Currency**: Built-in support for the Indian numbering system across all views (e.g., `₹45,00,000`, `₹18,50,000`).

### 2. 📊 Multi-View Data Engine
- **Spreadsheet Table View**: High-density interactive data grid with multi-column sorting, instant search filtering, dynamic column toggling, and inline cell editing.
- **Kanban Deal Pipeline Board**: Visual sales stages (`New Lead`, `Discovery`, `Meeting Scheduled`, `Proposal Sent`, `Closed Won`, `Closed Lost`) with drag-and-drop transitions, win-probability recalculation, and real-time stage INR totals.
- **Record Detail Drawer**: Deep dive into individual records with interactive field editing, linked tasks, notes, and activity timeline.

### 3. ⏱️ Chronological Audit Timeline
- Automatically generates timeline events for every creation, stage transition, task completion, and field modification.
- Full traceability for sales and hardware delivery operations.

### 4. ⚡ Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Spotlight-style keyboard launcher to navigate records, switch views, create new entities, and trigger system actions in milliseconds.

### 5. 📈 Executive Analytics & Dashboard
- Real-time pipeline metrics: Total Active Pipeline ARR in INR (`₹`), Win Rate, Stage Conversion Funnel, and Task Productivity.

### 6. 🔒 Offline-First & Data Sovereignty
- Zero external tracking or mandatory cloud dependencies.
- Embedded local persistence in `~/.local/share/terarobots_crm/`.
- Full JSON backup export, import, and demo reset capabilities.

---

## 🛠 Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (UI / UX)"]
        UI[React 19 + TypeScript + Tailwind CSS]
        CMD[Global Command Palette - Cmd+K]
        VIEWS[Table Grid & Kanban Pipeline & Dashboard]
        API_ADAPTER[Tauri IPC Bridge / Mock Fallback]
    end

    subgraph NativeBackend ["Desktop Core (Tauri v2 + Rust)"]
        IPC[#[tauri::command] IPC Handlers]
        META_ENGINE[Dynamic Metadata Engine]
        STORE[Transactional Storage Engine / db.rs]
        LOCAL_DB[("Local Disk DB (~/.local/share/terarobots_crm/)")]
    end

    UI --> CMD
    UI --> VIEWS
    VIEWS --> API_ADAPTER
    API_ADAPTER -->|High-speed IPC| IPC
    IPC --> META_ENGINE
    META_ENGINE --> STORE
    STORE --> LOCAL_DB
```

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Desktop Runtime** | [Tauri v2](https://v2.tauri.app/) | Secure, lightweight native desktop binary compiled in Rust |
| **Backend Core** | [Rust](https://www.rust-lang.org/) | Memory-safe, high-speed business logic, JSON persistence, and seed management |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Strict typing, reactive state, and dynamic schema rendering |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern dark-mode optimized enterprise UI |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons |
| **Bundler & Tooling** | [Vite 8](https://vitejs.dev/) + [Oxlint](https://oxc.rs/) | Sub-second HMR and blazing fast linting |
| **Persistence** | Embedded Local JSON / SQLite | Local transactional file store with atomic file operations |

---

## 📁 Project Structure

```text
TeraRobots CRM/
├── .github/                     # GitHub workflows and CI configurations
├── public/                      # Static web assets & icons
├── src/                         # Frontend React 19 application
│   ├── api/
│   │   └── tauriApi.ts          # Tauri IPC bindings & fallback mock layer
│   ├── assets/                  # Images and static media
│   ├── components/              # UI components
│   │   ├── CommandMenu.tsx      # Global Cmd+K palette
│   │   ├── CreateRecordModal.tsx# Record creation dialog
│   │   ├── CustomObjectModal.tsx# Custom object & field builder
│   │   ├── DashboardView.tsx    # Executive analytics & charts
│   │   ├── Header.tsx           # Global navigation header
│   │   ├── KanbanView.tsx       # Drag-and-drop pipeline board
│   │   ├── RecordDrawer.tsx     # Detail drawer & audit timeline
│   │   ├── SettingsView.tsx     # Metadata schemas & backup import/export
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── TableView.tsx        # High-density data grid
│   ├── mock/
│   │   └── seedData.ts          # Demo robotics seed data
│   ├── types/
│   │   └── crm.ts               # Shared TypeScript schemas & interfaces
│   ├── App.tsx                  # Main layout & router
│   ├── index.css                # Tailwind CSS entry
│   └── main.tsx                 # Frontend root mount
├── src-tauri/                   # Rust backend & Tauri v2 core
│   ├── capabilities/            # Tauri v2 security capabilities
│   ├── icons/                   # App icons for Linux, macOS & Windows
│   ├── src/
│   │   ├── commands.rs          # 16 native Tauri IPC commands
│   │   ├── db.rs                # Local storage engine & persistence
│   │   ├── lib.rs               # Tauri plugin and app builder
│   │   ├── main.rs              # Application entrypoint & display guards
│   │   └── models.rs            # Rust structs for objects, fields & activity
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri application configuration
├── package.json                 # Node dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## 🦀 Rust Backend & IPC Commands

The Rust desktop core (`src-tauri/src/commands.rs`) provides 16 high-performance IPC functions invoked directly by the React frontend:

- `get_workspace_meta`: Retrieves current workspace configuration and schema definitions.
- `list_records`: Fetches records with dynamic search, filter criteria, and sorting.
- `get_record`: Loads an individual record with linked tasks, notes, and chronological audit log.
- `create_record`: Inserts a record and logs a `RECORD_CREATED` timeline event.
- `update_record`: Edits record fields and logs a `FIELD_UPDATED` event.
- `delete_record`: Safely deletes records and cascades associated sub-entities.
- `update_opportunity_stage`: Moves deals between stages and updates win probability.
- `update_task_status`: Toggles task state (`TODO`, `IN_PROGRESS`, `DONE`).
- `create_custom_object`: Dynamically adds a new custom schema entity.
- `create_custom_field`: Appends custom fields with validation rules.
- `list_views` & `save_view`: Saves and loads custom view configurations.
- `get_analytics_summary`: Aggregates active pipeline value in INR, deal counts, and metrics.
- `export_data`: Backs up the entire database to a standalone JSON file.
- `import_data`: Restores full database state from JSON backup.
- `reset_to_demo_data`: Re-seeds the system with TeraRobots enterprise sample data.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:

- **Node.js**: v20+ and **pnpm** (`corepack enable pnpm` or `npm install -g pnpm`)
- **Rust**: v1.80+ and **Cargo** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- **Linux Packages** (Ubuntu/Debian/Fedora):
  ```bash
  # Debian / Ubuntu / Pop!_OS
  sudo apt update && sudo apt install -y build-essential curl wget libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev

  # Fedora
  sudo dnf install webkit2gtk4.1-devel gtk3-devel openssl-devel curl
  ```

### Installation

Clone the repository and install frontend dependencies:

```bash
git clone https://github.com/StalinoAJ/terarobots-crm.git
cd terarobots-crm
pnpm install
```

---

### 1. Web Development Mode

To run in browser development mode with local mock persistence:

```bash
pnpm dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### 2. Native Tauri Desktop Mode

To launch the native desktop application powered by the Rust core:

```bash
pnpm tauri:dev
```

---

### 3. Production Standalone Build

To bundle the application into an optimized standalone binary and installer:

```bash
pnpm tauri:build
```

The resulting package (`.deb`, `.AppImage`, or binary) will be saved in:
`src-tauri/target/release/bundle/`

---

## 🐧 Troubleshooting & Linux Notes

### Wayland & WebKitGTK Notice
Under modern Linux Wayland sessions, WebKitGTK can occasionally encounter `Protocol error dispatching to Wayland display` when hardware DMA-BUF composition is requested. 

TeraRobots CRM includes an automatic initialization guard in `src-tauri/src/main.rs`:
```rust
std::env::set_var("GDK_BACKEND", "x11");
std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
```
This guarantees rock-solid stability across both Wayland (via XWayland) and X11 display servers without manual environment configuration.

---

## 👤 Author & Credits

- **Developer**: StalinoAJ ([@StalinoAJ](https://github.com/StalinoAJ))
- **Organization**: Built for **TeraRobots**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
