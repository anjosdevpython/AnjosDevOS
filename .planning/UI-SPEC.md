# 🎨 UI-SPEC: AnjosDevOS Design System & Frontend Contract

**Version:** 1.2.0  
**Status:** Approved & Implemented  
**Date:** 2026-08-29  
**Scope:** Design tokens, Multi-Skin Architecture (macOS / CyberOS / Mobile), 29 App UI Specifications, Window Management, Motion & Ergonomics.

---

## 1. 📐 Design Tokens & Foundations

### 1.1 Color Palette & Semantics

| Token | Hex / Value | Semantic Role | Usage |
|---|---|---|---|
| `bg-cyber-bg` | `#07090e` | Deep Space Background | Base desktop background, editor gutter, window bodies |
| `bg-cyber-card` | `#0e121d` | Glass Surface Elevation 1 | Cards, panels, toolbars, sidebar elements |
| `bg-cyber-hover` | `#141a29` | Interactive Hover State | Button hover, list item focus |
| `border-cyber-border` | `#1a2234` | Subtle Separation | Window outlines, panel splitters, card borders |
| `text-primary` | `#f8fafc` | High Emphasis Text | Headers, active titles, code keywords |
| `text-secondary` | `#94a3b8` | Medium Emphasis Text | Body descriptions, subtitles |
| `text-muted` | `#64748b` | Low Emphasis Text | Metadata, timestamps, shortcuts |
| `text-neon-cyan` | `#06b6d4` | Primary Accent / Workspaces | Brand primary, links, active tab indicator |
| `text-neon-green` | `#00ff88` | Success / Activity | KPIs, online status, test passes |
| `text-neon-purple` | `#a855f7` | MCP & Automation Accent | Flow nodes, MCP badges, DevTools |
| `text-neon-yellow` | `#ffd700` | Stars / Warnings / Groq | Rating stars, warning alerts, caution badges |
| `text-neon-red` | `#ff3366` | Critical / Errors / Traffic Close | Error states, stop buttons, close window 🔴 |

### 1.2 Typography Hierarchy

- **Sans / Interface:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Mono / Code / Telemetry:** `"JetBrains Mono", "Fira Code", monospace`
- **Display Title:** `text-base font-bold font-mono tracking-tight` (Window Headers & App Titles)
- **Section Heading:** `text-sm font-semibold text-text-primary`
- **Body Text:** `text-xs leading-relaxed text-text-secondary font-sans`
- **Caption / Metadata:** `text-[10px] font-mono text-text-muted uppercase tracking-wider`
- **Micro Badge:** `text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full`

### 1.3 Glassmorphism & Elevation Specs

```css
/* macOS Sonoma Ultra-Blur Glass Layer */
backdrop-filter: blur(48px) saturate(180%);
background: rgba(18, 21, 30, 0.75);
box-shadow: 
  0 25px 70px rgba(0, 0, 0, 0.85),
  inset 0 1px 1px rgba(255, 255, 255, 0.25),
  0 0 0 1px rgba(255, 255, 255, 0.08);

/* Apple Squircle Icon Shadow Spec */
box-shadow: 
  0 8px 20px -4px rgba(0,0,0,0.45),
  0 2px 6px rgba(0,0,0,0.2),
  inset 0 1px 1px rgba(255,255,255,0.7),
  inset 0 -0.5px 0.5px rgba(0,0,0,0.2);
```

---

## 2. 🖥️ Multi-Skin System Architecture

AnjosDevOS supports 3 interchangeable operating system skins seamlessly synchronized with the centralized `OSContext`:

```
                    ┌────────────────────────┐
                    │      <OSProvider>      │
                    │  (Windows / Apps State)│
                    └───────────┬────────────┘
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   macOS Sonoma   │  │     CyberOS      │  │   Mobile Touch   │
│ (Desktop Apple)  │  │(Taskbar/Win-Dark)│  │ (Single-pane App)│
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 2.1 Skin 1: Apple macOS Sonoma / Sequoia (Desktop Default)
- **Top Menu Bar (`MacOSMenuBar.tsx`):**
  - Height: `28px` fixed, `z-index: 99990`.
  - Left:  Apple menu dropdown, Active App title in bold, File/Edit menus.
  - Right: Interface Mode Selector (`macOS ▾`), Battery (100%), Wi-Fi, Spotlight (🔍), Siri Assistant (🔮), Control Center (🎛️), Live Clock/Date.
- **Window Management (`MacOSWindow.tsx`):**
  - Top-Left Traffic Lights: 🔴 Close (`#ff5f56`), 🟡 Minimize (`#ffbd2e`), 🟢 Fullscreen Zoom (`#27c93f`).
  - Max usable height: `calc(100vh - 28px - 82px)` (never overlaps the dock).
  - Double click titlebar to zoom/maximize. Draggable across screen.
- **Floating Dock (`MacOSDock.tsx`):**
  - Centered bottom floating pill (`bottom-3`, `rounded-[22px]`).
  - Interactive **Hover Magnification** (icon scales from `1.0` to `1.35x` near mouse cursor).
  - Running indicator dot (`•`) underneath open windows.
  - Interactive bounce animation on app launch.
- **Spotlight Search (`MacOSSpotlight.tsx`):**
  - Shortcut: `Cmd + Space` or `Ctrl + Space`.
  - Floating centered modal (`w-[580px]`) searching all 29 apps with keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).
- **Launchpad (`MacOSLaunchpad.tsx`):**
  - Fullscreen blur backdrop with responsive grid (7-8 columns on widescreen).

### 2.2 Skin 2: CyberOS (Cyberpunk Windows/Linux Style)
- **Bottom Taskbar (`Taskbar.tsx`):** Start Menu with search, running app tiles, system tray clock.
- **Neon Glass Theme:** Cyan and green glow effects, sharp geometric panels.

### 2.3 Skin 3: Mobile Mode (`MobileLayout.tsx`)
- Single-pane active window focus.
- Bottom navigation tab bar for fast app switching.
- Touch-optimized hit targets (minimum `44px × 44px`).

---

## 3. 📱 29 Native Apps UI Architecture

| App ID | Title | Primary Layout | Accent | Key UI Feature |
|---|---|---|---|---|
| `workspaces` | Workspaces | Master-Detail List + Modal | Cyan | GitHub Sync modal with PAT, repo, and commit input |
| `codeeditor` | Code Editor | 4-Panel IDE (CSS Grid) | Blue | Monaco Editor, DiffEditor (Patch), File Tree, Swarm Panel |
| `terminal` | Terminal | Full xterm.js Shell | Green | Interactive WebContainers shell + xterm-addon-fit |
| `automation-studio` | Automation Studio | Graph Canvas + Inspector | Orange | Topological DAG nodes, Prompt-to-Flow bar, live run logs |
| `mcp-servers` | MCP Servers | 3-Column Responsive Grid | Purple | Latency ping monitor, enable switches, endpoint editor |
| `tools` | AI Tools Hub | Category Grid + Modal | Cyan | 21 Skills executor with LLM selector, markdown output |
| `devtools-hub` | DevTools Hub | Catalog Grid + Detail Panel | Purple | Action buttons for Continue, Aider, Cline, OpenClaw |
| `dashboard` | Dashboard | KPI Cards + Metrics Chart | Green | Real-time token consumption, request charts, auto-refresh |
| `chat` | Chat IA | Thread + Floating Input | Green | Provider switcher, temperature slider, code snippet copy |
| `images` | Gerador de Imagens | Prompt Bar + Gallery Grid | Blue | DALL-E / Imagen / Flux gallery with aspect ratio picker |
| `warmwind` | Funcionários IA | Tabbed (Employees/Store) | Purple | 8 AI agents, 20+ App Store integrations |
| `settings` | Configurações | Tabbed Form Accordion | Gray | 11 AI provider keys, server vault status |

---

## 4. ⌨️ Keyboard Shortcuts & Interaction Matrix

| Shortcut | Action | Scope |
|---|---|---|
| `Cmd + Space` / `Ctrl + Space` | Open Spotlight Search | Global (macOS) |
| `Esc` | Close Spotlight / Launchpad / Modal | Global |
| `Cmd + W` / `Ctrl + W` | Close Active Window | Window Focused |
| `Cmd + M` / `Ctrl + M` | Minimize Active Window | Window Focused |
| `Cmd + F` | Zoom / Toggle Maximize Window | Window Focused |
| `Ctrl + P` | Quick Open File Search | Code Editor |
| `Ctrl + \`` | Toggle Embedded Terminal | Code Editor |
| `Ctrl + Shift + O` | Symbol Search | Code Editor |

---

## 5. ♿ Accessibility & Responsiveness Contract

1. **Contrast Ratios:** All user-facing text elements meet **WCAG 2.1 AA** (minimum 4.5:1 ratio against `#07090e` and glass card surfaces).
2. **Z-Index Layering Order:**
   - Desktop Wallpaper & Icons: `z-0`
   - Window Instances: `z-[10]` to `z-[50]` (active window receives top z-index)
   - macOS Dock: `z-[99990]`
   - macOS Top MenuBar: `z-[99990]`
   - Control Center Dropdown: `z-[99995]`
   - Launchpad Fullscreen: `z-[99998]`
   - Spotlight Search & System Modals: `z-[99999]`
3. **Motion Settings:** All transitions adhere to `cubic-bezier(0.16, 1, 0.3, 1)` (Apple standard spring curve).