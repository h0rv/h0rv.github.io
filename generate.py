import os
import shutil
from datetime import datetime
from dataclasses import dataclass, field

import markdown2
import yaml


@dataclass
class Config:
    # Directories
    content_dir: str = "content"
    static_dir: str = "static"
    blog_dir: str = "blog"
    output_dir: str = "public"

    # Files
    css_file: str = "style.css"
    index_file: str = "index.html"

    # Metadata defaults
    default_title: str = "Untitled"
    default_description: str = ""

    # Special settings
    special_dirs: list[str] = field(default_factory=lambda: ["blog"])
    nav_exclude: list[str] = field(default_factory=lambda: ["404.md", "draft-"])
    nav_title_map: dict[str, str] = field(default_factory=lambda: {"index.md": "Home"})

    # Site info
    author: str = "h0rv"
    copyright_text: str = "© {year} {author} - CC BY 4.0"

    # SEO settings
    site_url: str = ""  # Set this to your domain, e.g. "https://example.com/"
    site_name: str = ""  # Name of your site for SEO


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

        # Computed paths
        self.blog_dir = os.path.join(self.config.content_dir, self.config.blog_dir)

    def parse_markdown(self, path: str) -> Page:
        """Parse a Markdown file with YAML frontmatter into a Page object."""
        with open(path, "r") as f:
            text = f.read()

        # Split frontmatter and content
        parts = text.split("---", 2)

        # Extract metadata and content
        if len(parts) >= 3:
            meta = yaml.safe_load(parts[1] or "{}")
            content = parts[2]
        else:
            meta = {}
            content = text

        # Create filename-based title if none provided
        if "title" not in meta or not meta["title"]:
            filename = os.path.basename(path)
            meta["title"] = self.config.nav_title_map.get(
                filename, filename.replace(".md", "")
            )

        # Convert markdown to HTML
        html = markdown2.markdown(content, extras=["fenced-code-blocks", "tables"])

        # Create and return Page object
        page = Page(
            title=meta.get("title", self.config.default_title),
            description=meta.get("description", self.config.default_description),
            tags=meta.get("tags", []),
            date=meta.get("date", ""),
            content=html,
            draft=meta.get("draft", False),
            path=path,
        )

        return page

    def format_date(self, date_str: str) -> str:
        """Format a date string from YYYY-MM-DD to Month DD, YYYY."""
        if not date_str:
            return ""
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            return date_obj.strftime("%B %d, %Y")
        except:
            return date_str

    def get_navigation_items(self) -> dict[str, dict]:
        """Discover content files for navigation."""
        nav_items = {}

        # Get top-level pages
        for item in sorted(os.listdir(self.config.content_dir)):
            full_path = os.path.join(self.config.content_dir, item)

            # Skip hidden files and directories
            if item.startswith("."):
                continue

            if os.path.isfile(full_path) and item.endswith(".md"):
                # Skip excluded files
                if any(exclude in item for exclude in self.config.nav_exclude):
                    continue

                # Parse page to check for draft status
                page = self.parse_markdown(full_path)
                if page.draft:
                    continue

                # Add to navigation
                output_path = item.replace(".md", ".html")
                nav_items[output_path] = {
                    "title": page.title,
                    "path": output_path,
                    "is_dir": False,
                }

            elif os.path.isdir(full_path) and item in self.config.special_dirs:
                # Add directory to navigation
                nav_items[item] = {
                    "title": item.capitalize(),
                    "path": f"{item}/{self.config.index_file}",
                    "is_dir": True,
                }

        return nav_items

    def render_nav(self, rel_path: str = "", current_path: str = "") -> str:
        """Render navigation HTML."""
        nav_items = self.get_navigation_items()

        nav_html = "<nav><ul>"

        for item_key, item in nav_items.items():
            # Check if current page
            is_active = current_path and (
                current_path.endswith(item["path"])
                or (item["is_dir"] and item["path"].split("/")[0] in current_path)
            )

            active_class = ' class="active"' if is_active else ""
            item_url = f"{rel_path}{item['path']}"

            nav_html += (
                f'<li><a href="{item_url}"{active_class}>{item["title"]}</a></li>'
            )

        nav_html += "</ul></nav>"
        return nav_html

    def render_tags(self, tags: list[str]) -> str:
        """Render HTML for tags in a minimal format."""
        if not tags:
            return ""

        return f'<div class="tags">{", ".join(tags)}</div>'

    def render_page(
        self, page: Page, rel_path: str = "", current_path: str = ""
    ) -> str:
        """Render a complete HTML page with SEO improvements."""
        # Meta section with date and tags for blog posts (simplified)
        meta_html = ""
        if page.date:
            formatted_date = self.format_date(page.date)
            tags_str = self.render_tags(page.tags)
            meta_html = (
                f'<div class="post-meta">Published on {formatted_date} {tags_str}</div>'
            )

        # Navigation
        nav_html = self.render_nav(rel_path, current_path)

        # Footer
        year = datetime.now().year
        footer = self.config.copyright_text.format(year=year, author=self.config.author)

        # CSS path
        css_path = f"{rel_path}{self.config.static_dir}/{self.config.css_file}"

        # SEO tags
        canonical_url = (
            f"{self.config.site_url}{current_path}"
            if hasattr(self.config, "site_url")
            else ""
        )
        og_tags = ""
        if canonical_url:
            og_tags = f"""
  <meta property="og:title" content="{page.title}">
  <meta property="og:description" content="{page.description}">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:type" content="{"article" if page.date else "website"}">
  <meta name="twitter:card" content="summary">"""

        # Create HTML
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page.title}</title>
  <meta name="description" content="{page.description}">
  <meta name="author" content="{self.config.author}">
  {f'<link rel="canonical" href="{canonical_url}">' if canonical_url else ""}
  {og_tags}
  {f'<meta name="keywords" content="{", ".join(page.tags)}">' if page.tags else ""}
  <link rel="stylesheet" href="{css_path}">
</head>
<body>
  <div class="container">
    <header>
      {nav_html}
      <h1>{page.title}</h1>
      {f"<p>{page.description}</p>" if page.description else ""}
    </header>
    <main>
      {meta_html}
      {page.content}
    </main>
    <footer>
      <p>{footer}</p>
    </footer>
  </div>
</body>
</html>"""

    def build_page(
        self, src_path: str, dest_path: str, rel_path: str = "", current_path: str = ""
    ) -> None:
        """Build a single page."""
        # Parse markdown
        page = self.parse_markdown(src_path)

        # Skip drafts
        if page.draft:
            return

        # Set URL for the page
        page.url = os.path.basename(dest_path)

        # Render HTML
        html = self.render_page(page, rel_path, current_path)

        # Write to file
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "w") as f:
            f.write(html)

    def build_blog_index(self) -> None:
        """Create a simplified blog index page."""
        # Get all blog posts
        posts = []

        if os.path.exists(self.blog_dir):
            for filename in os.listdir(self.blog_dir):
                if filename.endswith(".md"):
                    src_path = os.path.join(self.blog_dir, filename)
                    page = self.parse_markdown(src_path)

                    # Skip drafts
                    if page.draft:
                        continue

                    # Set URL
                    page.url = filename.replace(".md", ".html")
                    posts.append(page)

        # Sort posts by date (newest first)
        posts.sort(key=lambda p: p.date if p.date else "", reverse=True)

        # Generate more compact index content
        content = "<h2>Blog Posts</h2><ul class='post-list'>"

        for post in posts:
            date_str = f" ({self.format_date(post.date)})" if post.date else ""

            content += f"""
            <li class="post-item">
              <a href="{post.url}">{post.title}</a>{date_str}
            </li>
            """

        content += "</ul>"

        # Create index page
        index_page = Page(title="Blog", content=content)

        # Set path for nav highlighting
        current_path = f"{self.config.blog_dir}/{self.config.index_file}"

        # Render and write HTML
        blog_dir_path = os.path.join(self.config.output_dir, self.config.blog_dir)
        index_path = os.path.join(blog_dir_path, self.config.index_file)

        os.makedirs(blog_dir_path, exist_ok=True)

        html = self.render_page(index_page, rel_path="../", current_path=current_path)
        with open(index_path, "w") as f:
            f.write(html)

    def copy_static_files(self) -> None:
        """Copy static files to output directory."""
        static_output = os.path.join(self.config.output_dir, self.config.static_dir)

        # Create static directory if it doesn't exist
        if not os.path.exists(self.config.static_dir):
            os.makedirs(self.config.static_dir, exist_ok=True)

            # Create default CSS file
            css_path = os.path.join(self.config.static_dir, self.config.css_file)
            if not os.path.exists(css_path):
                with open(css_path, "w") as f:
                    f.write("/* Default styles for minimal site */")

        # Copy to output
        if os.path.exists(self.config.static_dir):
            if os.path.exists(static_output):
                shutil.rmtree(static_output)
            shutil.copytree(self.config.static_dir, static_output)

    def generate_sitemap(self) -> None:
        """Generate sitemap.xml for better SEO."""
        if not hasattr(self.config, "site_url") or not self.config.site_url:
            return

        # Collect all pages
        pages = []

        # Add regular pages
        for filename in os.listdir(self.config.content_dir):
            if filename.endswith(".md") and not any(
                exclude in filename for exclude in self.config.nav_exclude
            ):
                full_path = os.path.join(self.config.content_dir, filename)
                page = self.parse_markdown(full_path)

                if not page.draft:
                    pages.append(
                        {
                            "url": f"{self.config.site_url}{filename.replace('.md', '.html')}",
                            "date": page.date or datetime.now().strftime("%Y-%m-%d"),
                        }
                    )

        # Add blog pages
        if os.path.exists(self.blog_dir):
            for filename in os.listdir(self.blog_dir):
                if filename.endswith(".md"):
                    full_path = os.path.join(self.blog_dir, filename)
                    page = self.parse_markdown(full_path)

                    if not page.draft:
                        pages.append(
                            {
                                "url": f"{self.config.site_url}{self.config.blog_dir}/{filename.replace('.md', '.html')}",
                                "date": page.date
                                or datetime.now().strftime("%Y-%m-%d"),
                            }
                        )

            # Add blog index
            pages.append(
                {
                    "url": f"{self.config.site_url}{self.config.blog_dir}/{self.config.index_file}",
                    "date": datetime.now().strftime("%Y-%m-%d"),
                }
            )

        # Generate XML
        sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

        for page in pages:
            sitemap += "  <url>\n"
            sitemap += f"    <loc>{page['url']}</loc>\n"
            sitemap += f"    <lastmod>{page['date']}</lastmod>\n"
            sitemap += "  </url>\n"

        sitemap += "</urlset>"

        # Write sitemap file
        sitemap_path = os.path.join(self.config.output_dir, "sitemap.xml")
        with open(sitemap_path, "w") as f:
            f.write(sitemap)

    def generate_robots_txt(self) -> None:
        """Generate robots.txt file."""
        if not hasattr(self.config, "site_url") or not self.config.site_url:
            return

        robots = "User-agent: *\nAllow: /\n"

        # Add sitemap location
        robots += f"Sitemap: {self.config.site_url}sitemap.xml\n"

        # Write robots.txt
        robots_path = os.path.join(self.config.output_dir, "robots.txt")
        with open(robots_path, "w") as f:
            f.write(robots)

    def build(self) -> None:
        """Build the entire site."""
        print("Building site...")

        # Create output directory
        os.makedirs(self.config.output_dir, exist_ok=True)

        # Copy static files
        self.copy_static_files()

        # Build regular pages
        for filename in os.listdir(self.config.content_dir):
            full_path = os.path.join(self.config.content_dir, filename)

            if os.path.isfile(full_path) and filename.endswith(".md"):
                dest_path = os.path.join(
                    self.config.output_dir, filename.replace(".md", ".html")
                )
                current_path = filename.replace(".md", ".html")
                self.build_page(full_path, dest_path, current_path=current_path)

        # Build blog posts
        if os.path.exists(self.blog_dir):
            blog_output = os.path.join(self.config.output_dir, self.config.blog_dir)
            os.makedirs(blog_output, exist_ok=True)

            for filename in os.listdir(self.blog_dir):
                if filename.endswith(".md"):
                    src_path = os.path.join(self.blog_dir, filename)
                    dest_path = os.path.join(
                        blog_output, filename.replace(".md", ".html")
                    )
                    current_path = os.path.join(
                        self.config.blog_dir, filename.replace(".md", ".html")
                    )

                    self.build_page(
                        src_path, dest_path, rel_path="../", current_path=current_path
                    )

            # Create blog index
            self.build_blog_index()

        # Generate sitemap.xml for SEO
        self.generate_sitemap()

        # Generate robots.txt
        self.generate_robots_txt()

        print(f"Site built successfully in {self.config.output_dir}/")


if __name__ == "__main__":
    SiteGenerator().build()
