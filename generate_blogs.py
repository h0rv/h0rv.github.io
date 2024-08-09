import os
from datetime import date

import markdown
import yaml

import html_utils
from config import Config

blogs_dir = Config.Markdown.blogs_input_dir
html_blogs_dir = Config.HTML.blogs_output_dir
html_blog_index_file = Config.HTML.blogs_index


def generate_blogs_index():
    blog_posts = []

    for filename in os.listdir(blogs_dir):
        if not filename.endswith(".md"):
            continue

        file_path = os.path.join(blogs_dir, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split content into front matter and body
        _, front_matter, body = content.split("---", 2)
        metadata = yaml.safe_load(front_matter)

        if metadata.get("draft", False):
            # Skip draft posts
            continue

        title = metadata["title"]
        blog_date = metadata["date"]
        assert isinstance(blog_date, date), f"invalid date: {blog_date}"
        tags = metadata["tags"]
        description = metadata["description"]

        blog_posts.append(
            {
                "title": title,
                "date": blog_date,
                "filename": filename.replace(".md", ".html"),
                "tags": tags,
                "description": description,
            }
        )

    # Sort blog posts by date, newest first
    blog_posts.sort(key=lambda x: x["date"], reverse=True)

    # Generate HTML for blog listing
    posts_html = []
    for post in blog_posts:
        posts_html.append(f"""
        <li>
            <a href="/blogs/{post["filename"]}">{post["title"]}</a>
            - {post["date"].strftime("%B %d, %Y")}
        </li>
        """)

    html_content = f"""
    <h2>Blog Posts</h2>

    <ul>
    {"\n".join(posts_html)}
    </ul>
    """

    html_body = f"""
        <div class="content">
            {html_content}
        </div>
    """

    html_page = html_utils.get(post["title"], post["description"], "", html_body)

    return html_page


def generate_blog_posts():
    for filename in os.listdir(blogs_dir):
        if not filename.endswith(".md"):
            continue

        file_path = os.path.join(blogs_dir, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split content into front matter and body
        _, front_matter, body = content.split("---", 2)
        metadata = yaml.safe_load(front_matter)

        # Check if the post is a draft
        if metadata.get("draft", False):
            continue  # Skip draft posts

        title = metadata["title"]
        blog_date = metadata["date"]
        assert isinstance(blog_date, date), f"invalid date: {blog_date}"

        html_body = markdown.markdown(body)

        html_content = f"""
        <div class="content">
            <h1 class="blog_title">{title}</h1>
            <small>{blog_date.strftime('%B %d, %Y')}</small>

            {html_body}
        </div>
        """

        html_page = html_utils.get(
            metadata["title"],
            metadata["description"],
            metadata["tags"],
            html_content,
        )

        output_filename = os.path.join(html_blogs_dir, filename.replace(".md", ".html"))

        yield output_filename, html_page


def main():
    html = generate_blogs_index()

    html_utils.write(html_blog_index_file, html)

    for file_path, html in generate_blog_posts():
        html_utils.write(file_path, html)


if __name__ == "__main__":
    main()
