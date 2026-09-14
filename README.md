# TerOS

A nature / retro-inspired WebOS that lives entirely in your browser.

TerOS was made for the **Stardance challenge** as a small experimental project built around a simple idea: make a browser-based OS that feels calm, nostalgic, and a little different.

The name comes from the Greek concept of "other" — an alternative little world inside your browser.

TerOS is not a real operating system. It is a simulated desktop with its own apps, files, settings, terminal, and a small garden that grows while you use it.

---

## Features

**10 apps** — Calculator, Calendar, Terminal, Notes, Files, Garden, Tree, Settings, Devlog, System Info.

**Files** — files, notes, plant progress, settings, wallpaper, and theme are saved using `localStorage`.

**Garden** — grow a plant simply by using TerOS. The plant grows a little over time, and watering it speeds up its growth. The exact growth mechanics are intentionally left unexplained.

**Tree** — a separate tree that slowly develops as you spend time in TerOS.

**Files** — a simulated filesystem with folders, breadcrumbs, creating, renaming, moving, deleting, searching, and sorting.

**Notes** — a simple text editor with autosaving, search, and timestamps.

**Terminal** — a simulated command-line interface with commands such as `help`, `ls`, `cd`, `tree`, `mkdir`, `touch`, `cat`, `rm`, `pwd`, `date`, `time`, `echo`, `neofetch`, `clear`, and `about`.

There are also a few hidden terminal commands.

**Devlog** — the development history of TerOS, documenting its different versions and how the project evolved.

**System Info** — basic information about the current TerOS environment.

---

## Screenshots

| Desktop View | Garden App |
|---|---|
| ![TerOS desktop screenshot](./assets/screenshot-page.png) | ![TerOS garden screenshot](./assets/screenshot-garden.png) |

---

## Run it

TerOS is built using only three files:

```text
TerOS/
├── index.html
├── styles.css
└── app.js
```

There is no build system and no external dependencies.

Open `index.html` directly in your browser, or use any static server:

TerOS can run completely offline.

---

## Keyboard

* **Meta / OS** — toggle start menu
* **Alt + Tab** — cycle window focus
* **Escape** — close menus and modals
* **Double-click a window header** — maximize / restore
* **Drag to screen edge** — snap left / right
* **Drag to the top edge** — maximize

---

## Design

TerOS uses a mix of retro desktop interfaces and nature.

The main visual style is built around:

* Dark forest greens
* Cream and beige
* Sage and muted natural tones
* Frosted-glass panels
* Pine silhouettes
* Procedural SVG wallpapers
* Your custom wallpaper
* Simple inline SVG icons
* Small, restrained animations

The wallpapers are generated entirely in code, so TerOS doesn't need image assets for its backgrounds, tho you can add them.

---

## Structure simple asf.

TerOS is built entirely with:

* HTML
* CSS
* JavaScript

No frameworks. No build tools. No backend.

Everything happens inside the browser.

---

## Roadmap

### V1.0

The first complete version of TerOS.

This version introduced the desktop, window manager, core applications, simulated filesystem, persistent storage, garden, themes, wallpapers, and the basic TerOS environment.

### V2.0

The next stage of TerOS development for WebOS2 by stardance is incoming.

Planned additions include:

* Music player
* Weather app
* More garden features
* More interactions
* More hidden things to discover
* General improvements and polish

More ideas will probably come along the way.

---

## Devlog

TerOS includes an in-system Devlog containing the development history of the project, from the early V0.1 builds through V1.0.

It documents how the project changed while being built rather than just listing the final features.

---

## About

TerOS is a solo experimental project made for the **Stardance challenge**.

It started as a simple idea for a nature-themed WebOS and gradually turned into a much larger browser environment with its own filesystem, applications, window manager, and things that continue changing while you use it.

Hope you like using my little creation Muahahaha
---

## License

MIT, Do whatever you want with it.