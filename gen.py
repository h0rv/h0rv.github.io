#!/usr/bin/env -S uv run
# /// script
# dependencies = ["markdown"]
# ///
from pathlib import Path
import markdown, re, shutil

Path("public").mkdir(exist_ok=True)

# Copy static files
if Path("content/static").exists():
    shutil.copytree("content/static", "public/static", dirs_exist_ok=True)

# Build navigation
nav_pages = [('Home', 'index.html')]
for f in Path("content").glob("*.md"):
    if f.stem != 'index':
        name = f.stem.replace('-', ' ').title()
        nav_pages.append((name, f"{f.stem}.html"))
nav = ' :: '.join(f'<a href="{link}">{name}</a>' for name, link in nav_pages)

def html(title, body, nav=''):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><title>{title}</title>' \
           f'<link rel="stylesheet" href="https://unpkg.com/classless-tufte-css@1.3.0/tufte.min.css">' \
           f'</head><body><nav>{nav}</nav><article>{body}</article></body></html>'

# Generate blog posts
posts = []
for f in Path("content/blog").glob("*.md"):
    text = f.read_text(encoding='utf-8-sig')  # Strip BOM if present
    title_raw = text.split('\n')[0].replace('#', '').strip()
    title_html = markdown.markdown(title_raw, extensions=['fenced_code', 'codehilite']).replace('<p>', '').replace('</p>', '').strip()
    date = text.split('\n')[1].strip()
    Path(f"public/{f.stem}.html").write_text(html(title_html, markdown.markdown(text), nav))
    posts.append((title_html, date, f.stem))

posts.sort(key=lambda p: p[1], reverse=True)

# Generate index with post list
index = re.sub(r'^---.*?---\n', '', Path("content/index.md").read_text(), flags=re.DOTALL)
post_list = "<hr><h2 style='margin-bottom:0.5rem'>Writing</h2><ul style='margin-top:0'>" + "".join(
    f'<li><a href="{slug}.html">{title}</a> <small>{date}</small></li>'
    for title, date, slug in posts
) + "</ul>"
Path("public/index.html").write_text(html("Home", markdown.markdown(index) + post_list, nav))

# Generate mediashelf
Path("public/mediashelf.html").write_text(
    html("Mediashelf", markdown.markdown(Path("content/mediashelf.md").read_text()), nav)
)

print(f"✓ Generated {len(posts)} posts + index + mediashelf")
