import markdown
import yaml

import html_utils
from config import Config

md_about_file = Config.Markdown.about
html_about_file = Config.HTML.about


def generate_about():

    with open(md_about_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract YAML front matter if it exists
    front_matter_match = content.split("---", 2)
    if len(front_matter_match) == 3:
        front_matter = front_matter_match[1]
        body = front_matter_match[2]
        metadata = yaml.safe_load(front_matter)
    else:
        body = content
        metadata = {}

    title = metadata.get("title")
    description = metadata.get("description")
    keywords = metadata.get("keywords")

    html_body = markdown.markdown(body)

    html_content = f"""
        <div class="content">
            {html_body}
        </div>
    """

    html_page = html_utils.get(title, description, keywords, html_content)

    return html_page


def main():
    html = generate_about()

    html_utils.write(html_about_file, html)

    print(f"{html_about_file} has been created successfully!")


if __name__ == "__main__":
    main()
