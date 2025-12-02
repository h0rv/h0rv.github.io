# /// script
# dependencies = [
#   "markdown2>=2.5.3",
#   "pyyaml>=6.0.2",
# ]
# ///

import os
import shutil
from datetime import datetime, date
from dataclasses import dataclass, field

import markdown2
import yaml


@dataclass
class Config:
    content_dir: str = "content"
    static_dir: str = "static"
    blog_dir: str = "blog"
    output_dir: str = "public"
    css_file: str = "style.css"
    index_file: str = "index.html"
    default_title: str = "Untitled"
    default_description: str = ""
    special_dirs: list[str] = field(default_factory=lambda: ["blog"])
    nav_exclude: list[str] = field(
        default_factory=lambda: ["404.md", "draft-", "library.md"]
    )
    nav_title_map: dict[str, str] = field(default_factory=lambda: {"index.md": "Home"})
    author: str = "h0rv"
    copyright_text: str = "© {year} {author} - CC BY 4.0"
    site_url: str = ""
    site_name: str = ""


@dataclass
class Page:
    title: str
    description: str = ""
    tags: list[str] = field(default_factory=list)
    date: str = ""
    content: str = ""
    draft: bool = False
    path: str = ""
    url: str = ""


class SiteGenerator:
    def __init__(self, config: Config | None = None):
        self.config = config or Config()

    def parse_markdown(self, path: str) -> Page:
        with open(path, "r") as f:
            text = f.read()
        parts = text.split("---", 2)
        meta = yaml.safe_load(parts[1] or "{}") if len(parts) >= 3 else {}
        content = parts[2] if len(parts) >= 3 else text
        if "title" not in meta or not meta["title"]:
            filename = os.path.basename(path)
            meta["title"] = self.config.nav_title_map.get(
                filename, filename.replace(".md", "")
            )
        return Page(
            title=meta.get("title", self.config.default_title),
            description=meta.get("description", self.config.default_description),
            tags=meta.get("tags", []),
            date=meta.get("date", ""),
            content=markdown2.markdown(
                content, extras=["fenced-code-blocks", "tables"]
            ),
            draft=meta.get("draft", False),
            path=path,
        )

    def format_date(self, dt: str | date) -> str:
        return datetime.strptime(
            dt.strftime("%Y-%m-%d") if isinstance(dt, date) else dt, "%Y-%m-%d"
        ).strftime("%B %d, %Y")

    def get_navigation_items(self) -> dict[str, dict]:
        nav_items = {}
        for item in sorted(os.listdir(self.config.content_dir)):
            if item.startswith("."):
                continue
            full_path = os.path.join(self.config.content_dir, item)
            if (
                os.path.isfile(full_path)
                and item.endswith(".md")
                and not any(exclude in item for exclude in self.config.nav_exclude)
            ):
                page = self.parse_markdown(full_path)
                if not page.draft:
                    nav_items[item.replace(".md", ".html")] = {
                        "title": page.title,
                        "path": item.replace(".md", ".html"),
                        "is_dir": False,
                    }
            elif os.path.isdir(full_path) and item in self.config.special_dirs:
                nav_items[item] = {
                    "title": item.capitalize(),
                    "path": f"{item}/{self.config.index_file}",
                    "is_dir": True,
                }
        return nav_items

    def render_nav(self, rel_path: str = "", current_path: str = "") -> str:
        nav_items = self.get_navigation_items()
        items = []
        for item in nav_items.values():
            is_active = current_path and (
                current_path.endswith(item["path"])
                or (item["is_dir"] and item["path"].split("/")[0] in current_path)
            )
            active_attr = ' class="active"' if is_active else ""
            items.append(
                f'<li><a href="{rel_path}{item["path"]}"{active_attr}>{item["title"]}</a></li>'
            )
        return "<nav><ul>" + "".join(items) + "</ul></nav>"

    def render_tags(self, tags: list[str]) -> str:
        if not tags:
            return ""
        tag_elements = "".join(f'<span class="tag">{tag}</span>' for tag in tags)
        return f'<div class="tags">{tag_elements}</div>'

    def get_blog_posts(self) -> list[Page]:
        blog_dir = os.path.join(self.config.content_dir, self.config.blog_dir)
        if not os.path.exists(blog_dir):
            return []
        posts = []
        for filename in os.listdir(blog_dir):
            if filename.endswith(".md"):
                page = self.parse_markdown(os.path.join(blog_dir, filename))
                if not page.draft:
                    page.url = (
                        f"{self.config.blog_dir}/{filename.replace('.md', '.html')}"
                    )
                    posts.append(page)
        posts.sort(key=lambda p: p.date or "", reverse=True)
        return posts

    def render_blog_list(self) -> str:
        posts = self.get_blog_posts()
        if not posts:
            return ""
        blog_html = "<h2>Blog Posts</h2><ul class='post-list'>"
        blog_html += "".join(
            f'<li class="post-item"><a href="{post.url}">{post.title}</a>{" (" + self.format_date(post.date) + ")" if post.date else ""}</li>'
            for post in posts
        )
        blog_html += "</ul>"
        return blog_html

    def render_page(
        self,
        page: Page,
        rel_path: str = "",
        current_path: str = "",
        include_blog_list: bool = False,
    ) -> str:
        canonical_url = (
            f"{self.config.site_url}{current_path}" if self.config.site_url else ""
        )
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page.title}</title>
  <meta name="description" content="{page.description}">
  <meta name="author" content="{self.config.author}">
  {f'<link rel="canonical" href="{canonical_url}">' if canonical_url else ""}
  {
            f'''
  <meta property="og:title" content="{page.title}">
  <meta property="og:description" content="{page.description}">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:type" content="{"article" if page.date else "website"}">
  <meta name="twitter:card" content="summary">'''
            if canonical_url
            else ""
        }
  {f'<meta name="keywords" content="{", ".join(page.tags)}">' if page.tags else ""}
  <link rel="stylesheet" href="{rel_path}{self.config.static_dir}/{
            self.config.css_file
        }">
</head>
<body>
  <div class="container">
    <header>
      {f"<h1>{page.title}</h1>" if page.title != "Home" else ""}
      {f"<p>{page.description}</p>" if page.description else ""}
    </header>
    <main>
      {
            f'<div class="post-meta">Published on {self.format_date(page.date)} {self.render_tags(page.tags)}</div>'
            if page.date
            else ""
        }
      {page.content}
      {self.render_blog_list() if include_blog_list else ""}
    </main>
    <footer>
      <p>{
            self.config.copyright_text.format(
                year=datetime.now().year, author=self.config.author
            )
        }</p>
    </footer>
  </div>
</body>
</html>"""

    def build_page(
        self, src_path: str, dest_path: str, rel_path: str = "", current_path: str = ""
    ) -> None:
        # Skip library.md
        if os.path.basename(src_path) == "library.md":
            return
        page = self.parse_markdown(src_path)
        if page.draft:
            return
        page.url = os.path.basename(dest_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        # Include blog list on index page
        include_blog_list = os.path.basename(src_path) == "index.md"
        with open(dest_path, "w") as f:
            f.write(
                self.render_page(
                    page, rel_path, current_path, include_blog_list=include_blog_list
                )
            )

    def build_blog_index(self) -> None:
        blog_dir = os.path.join(self.config.content_dir, self.config.blog_dir)
        if not os.path.exists(blog_dir):
            return
        posts = []
        for filename in os.listdir(blog_dir):
            if filename.endswith(".md"):
                page = self.parse_markdown(os.path.join(blog_dir, filename))
                if not page.draft:
                    page.url = filename.replace(".md", ".html")
                    posts.append(page)
        posts.sort(key=lambda p: p.date or "", reverse=True)
        content = (
            "<h2>Blog Posts</h2><ul class='post-list'>"
            + "".join(
                f'<li class="post-item"><a href="{post.url}">{post.title}</a>{" (" + self.format_date(post.date) + ")" if post.date else ""}</li>'
                for post in posts
            )
            + "</ul>"
        )
        blog_dir_path = os.path.join(self.config.output_dir, self.config.blog_dir)
        os.makedirs(blog_dir_path, exist_ok=True)
        with open(os.path.join(blog_dir_path, self.config.index_file), "w") as f:
            f.write(
                self.render_page(
                    Page(title="Blog", content=content),
                    rel_path="../",
                    current_path=f"{self.config.blog_dir}/{self.config.index_file}",
                )
            )

    def copy_static_files(self) -> None:
        if not os.path.exists(self.config.static_dir):
            os.makedirs(self.config.static_dir, exist_ok=True)
            css_path = os.path.join(self.config.static_dir, self.config.css_file)
            if not os.path.exists(css_path):
                with open(css_path, "w") as f:
                    f.write("/* Default styles for minimal site */")
        static_output = os.path.join(self.config.output_dir, self.config.static_dir)
        if os.path.exists(static_output):
            shutil.rmtree(static_output)
        shutil.copytree(self.config.static_dir, static_output)

    def generate_sitemap(self) -> None:
        if not self.config.site_url:
            return
        pages = []
        for filename in os.listdir(self.config.content_dir):
            if filename.endswith(".md") and not any(
                exclude in filename for exclude in self.config.nav_exclude
            ):
                page = self.parse_markdown(
                    os.path.join(self.config.content_dir, filename)
                )
                if not page.draft:
                    pages.append(
                        {
                            "url": f"{self.config.site_url}{filename.replace('.md', '.html')}",
                            "date": page.date or datetime.now().strftime("%Y-%m-%d"),
                        }
                    )
        blog_dir = os.path.join(self.config.content_dir, self.config.blog_dir)
        if os.path.exists(blog_dir):
            for filename in os.listdir(blog_dir):
                if filename.endswith(".md"):
                    page = self.parse_markdown(os.path.join(blog_dir, filename))
                    if not page.draft:
                        pages.append(
                            {
                                "url": f"{self.config.site_url}{self.config.blog_dir}/{filename.replace('.md', '.html')}",
                                "date": page.date
                                or datetime.now().strftime("%Y-%m-%d"),
                            }
                        )
            pages.append(
                {
                    "url": f"{self.config.site_url}{self.config.blog_dir}/{self.config.index_file}",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                }
            )
        with open(os.path.join(self.config.output_dir, "sitemap.xml"), "w") as f:
            f.write(
                '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                + "".join(
                    f"  <url>\n    <loc>{p['url']}</loc>\n    <lastmod>{p['date']}</lastmod>\n  </url>\n"
                    for p in pages
                )
                + "</urlset>"
            )

    def generate_robots_txt(self) -> None:
        if not self.config.site_url:
            return
        with open(os.path.join(self.config.output_dir, "robots.txt"), "w") as f:
            f.write(
                f"User-agent: *\nAllow: /\nSitemap: {self.config.site_url}sitemap.xml\n"
            )

    def build(self) -> None:
        print("Building site...")
        os.makedirs(self.config.output_dir, exist_ok=True)
        self.copy_static_files()
        for filename in os.listdir(self.config.content_dir):
            full_path = os.path.join(self.config.content_dir, filename)
            if os.path.isfile(full_path) and filename.endswith(".md"):
                self.build_page(
                    full_path,
                    os.path.join(
                        self.config.output_dir, filename.replace(".md", ".html")
                    ),
                    current_path=filename.replace(".md", ".html"),
                )
        blog_dir = os.path.join(self.config.content_dir, self.config.blog_dir)
        if os.path.exists(blog_dir):
            blog_output = os.path.join(self.config.output_dir, self.config.blog_dir)
            os.makedirs(blog_output, exist_ok=True)
            for filename in os.listdir(blog_dir):
                if filename.endswith(".md"):
                    self.build_page(
                        os.path.join(blog_dir, filename),
                        os.path.join(blog_output, filename.replace(".md", ".html")),
                        rel_path="../",
                        current_path=os.path.join(
                            self.config.blog_dir, filename.replace(".md", ".html")
                        ),
                    )
            self.build_blog_index()
        self.generate_sitemap()
        self.generate_robots_txt()
        print(f"Site built successfully in {self.config.output_dir}/")


if __name__ == "__main__":
    SiteGenerator().build()
