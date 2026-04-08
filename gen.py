#!/usr/bin/env -S uv run
# /// script
# dependencies = ["markdown"]
# ///
from pathlib import Path
import markdown, re, shutil

Path("public").mkdir(exist_ok=True)
(Path("public") / "resume.html").unlink(missing_ok=True)

# Copy non-markdown files from content/
for f in Path("content").rglob("*"):
    if f.is_file() and f.suffix != ".md":
        dest = Path("public") / f.relative_to("content")
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(f, dest)

# Build navigation
nav_pages = [('Home', 'index.html')]
for f in Path("content").glob("*.md"):
    if f.stem != 'index':
        name = f.stem.replace('-', ' ').title()
        nav_pages.append((name, f"{f.stem}.html"))
nav_pages.append(('Resume', 'resume/'))
nav = ' · '.join(f'<a href="{link}">{name}</a>' for name, link in nav_pages)

def html(title, body, nav='', footer=''):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8">' \
           '<meta name="viewport" content="width=device-width, initial-scale=1">' \
           f'<title>{title}</title>' \
           '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tufte-css@1.8.0/tufte.min.css">' \
           '<style>nav{padding:1rem 0;font-size:1.05rem}nav a{padding:0.5rem}article{padding-bottom:1rem}@media(max-width:760px){nav a{display:inline-block;padding:0.5rem 0.75rem}}</style>' \
           f'</head><body><nav>{nav}</nav><article>{body}</article>{footer}' \
           '<script data-goatcounter="https://h0rv.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>' \
           '</body></html>'

# Generate blog posts
posts = []
for f in Path("content/blog").glob("*.md"):
    text = f.read_text(encoding='utf-8-sig')  # Strip BOM if present
    title_raw = text.split('\n')[0].replace('#', '').strip()
    title_plain = title_raw.replace('`', '')
    title_html = markdown.markdown(title_raw, extensions=['fenced_code', 'codehilite']).replace('<p>', '').replace('</p>', '').strip()
    date = text.split('\n')[1].strip()
    Path(f"public/{f.stem}.html").write_text(html(title_plain, markdown.markdown(text), nav))
    posts.append((title_html, date, f.stem))

posts.sort(key=lambda p: p[1], reverse=True)

# Generate index with post list
index = re.sub(r'^---.*?---\n', '', Path("content/index.md").read_text(), flags=re.DOTALL)
post_list = "<hr><h2 style='margin-bottom:0.5rem'>Writing</h2><ul style='margin-top:0'>" + "".join(
    f'<li><a href="{slug}.html">{title}</a> <small>{date}</small></li>'
    for title, date, slug in posts
) + "</ul>"
visitor_counter = '<div id="visitor-count" style="text-align:center;padding:1rem 0;font-size:0.9rem;color:#666"></div>' \
                  '<script>fetch("https://h0rv.goatcounter.com/counter//.json")' \
                  '.then(function(r){if(!r.ok)throw 0;return r.json()})' \
                  '.then(function(d){document.getElementById("visitor-count").textContent="You are visitor #"+d.count_unique})' \
                  '.catch(function(){document.getElementById("visitor-count").style.display="none"})</script>'
Path("public/index.html").write_text(html("Home", markdown.markdown(index) + post_list, nav, footer=visitor_counter))

# Generate mediashelf
Path("public/mediashelf.html").write_text(
    html("Mediashelf", markdown.markdown(Path("content/mediashelf.md").read_text()), nav)
)

# Publish the standalone resume section without mixing it into content/
resume_dir = Path("resume")
if resume_dir.exists():
    shutil.copytree(resume_dir, Path("public/resume"), dirs_exist_ok=True)
    resume_html = (resume_dir / "resume.html").read_text(encoding="utf-8")
    resume_html = resume_html.replace(
        "</style>",
        """
.site-resume-nav {
    max-width: 800px;
    margin: 0 auto 24px;
    text-align: left;
    font: 14px/1.4 "Helvetica Neue", Arial, sans-serif;
}
.site-resume-nav a {
    color: #1d4ed8;
    text-decoration: none;
    margin: 0 0.35rem;
}
.site-resume-nav a:hover {
    text-decoration: underline;
}
@media print {
    .site-resume-nav {
        display: none;
    }
}
</style>
""",
        1,
    )
    resume_links = (
        '<div class="site-resume-nav">'
        '<a href="../index.html">Home</a> · '
        '<a href="resume.pdf" target="_blank" rel="noopener">Open PDF</a> · '
        '<a href="resume.pdf" download>Download PDF</a>'
        '</div>'
    )
    resume_html = resume_html.replace("<body>", f"<body>{resume_links}", 1)
    Path("public/resume/index.html").write_text(resume_html, encoding="utf-8")

print(f"✓ Generated {len(posts)} posts + index + mediashelf + resume")
