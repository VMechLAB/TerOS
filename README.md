# TerOS

A little WebOS that lives in your browser. Forest greens, retro desktop vibes, and a plant that grows while you use it.

I made this for the **Stardance challenge**. I wanted a browser OS that felt calm and nostalgic instead of another glassy clone of Windows. The name comes from the Greek idea of "other", like a small alternative world inside a tab.

It's not a real operating system, just a simulated desktop with its own apps, files, terminal, and a garden.

---

## Screenshots

| Desktop | Garden |
|---|---|
| ![TerOS desktop screenshot](./assets/page.png) | ![TerOS garden screenshot](./assets/garden.png) |

---

## What's in it

There are 10 apps: Calculator, Calendar, Terminal, Notes, Files, Garden, Tree, Settings, Devlog and System Info.

- **Files** is a fake filesystem. You can make folders, rename, move, delete, search and sort, and there are breadcrumbs so you don't get lost.
- **Notes** is a plain text editor with autosave, search and timestamps.
- **Terminal** understands `help`, `ls`, `cd`, `tree`, `mkdir`, `touch`, `cat`, `rm`, `pwd`, `date`, `time`, `echo`, `neofetch`, `clear` and `about`. There are also a few hidden commands. Go find them.
- **Garden** has a plant that grows just because you're using TerOS. Watering it speeds things up. I'm not telling you how it works.
- **Tree** is a separate tree that slowly develops the longer you hang around.
- **Devlog** is the dev history of the project, from the early V0.1 builds up to V1.0. It covers how things changed along the way, not just a feature list.
- **System Info** shows basic info about your TerOS setup.

Files, notes, plant progress, settings, theme and wallpaper all save to `localStorage`, so everything is still there when you come back.

---

## Running it

It's three files:

```text
TerOS/
├── index.html
├── styles.css
└── app.js
```

No build step and no dependencies. Open `index.html` in your browser and you're done, or serve the folder with whatever you like:

```bash
python -m http.server
```

It works fully offline too.

---

## Keyboard and mouse

- **Meta / OS key**: toggle the start menu
- **Alt + Tab**: cycle window focus
- **Escape**: close menus and modals
- **Double-click a window header**: maximize / restore
- **Drag a window to the left or right edge**: snap it
- **Drag a window to the top edge**: maximize

---

## Look and feel

Dark forest greens, cream, beige and sage, with frosted panels and pine silhouettes. The wallpapers are procedural SVGs generated in code, so TerOS doesn't need any image files for its backgrounds. You can still upload your own wallpaper if you want. Icons are inline SVG and the animations are kept small.

Built with plain HTML, CSS and JavaScript. No frameworks, no backend, everything runs in the browser. Simple asf.

---

## Roadmap

**V1.0** is out. It has the desktop, window manager, core apps, fake filesystem, persistent storage, garden, themes and wallpapers.

**V2.0** is coming for WebOS2 by Stardance. Planned so far:

- Music player
- Weather app
- More garden stuff
- More interactions
- More hidden things
- General polish

More ideas will probably show up as I go.

---

## About

TerOS is a solo project. It started as "what if I made a nature-themed WebOS" and got way bigger than I planned, with a filesystem, a window manager and a bunch of apps.

Hope you like my little creation. Muahahaha

---

## License

MIT. Do whatever you want with it.
