# Resume

Edit `resume.md`, then `uv run resume.py` to rebuild `resume.pdf`. The site renders `resume.md` at `/resume/`.

WeasyPrint needs pango (`brew install pango`). On macOS, point it at Homebrew's libraries:
`DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib uv run resume.py`

Forked from [resume.md](https://github.com/mikepqr/resume.md).
