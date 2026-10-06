# [horv.co](https://horv.co/)

Static site, built with Astro. No JavaScript ships to visitors.

```sh
mise install && mise run install
mise run dev      # localhost:4321, press D for design mode
mise run fmt      # format + lint fixes (CI runs `mise run lint`)
mise run photos   # before committing photos: resize, strip GPS
mise run fonts    # optional: download the font lab for design mode
```

- `content/`: posts, photo rolls, mediashelf, projects, links
- `src/styles/tokens.css`: every design value (design mode saves here)
- `src/dev/`: design mode, font lab, photo script (dev only)
- `resume/`: resume source and PDF (`uv run resume.py`)
