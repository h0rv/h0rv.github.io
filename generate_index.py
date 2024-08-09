import markdown
import yaml

import html_utils
from config import Config

md_index_file = Config.Markdown.index
html_index_file = Config.HTML.index


def generate_index():

    with open(md_index_file, "r", encoding="utf-8") as f:
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
    logo_path = metadata.get("logo_path")

    html_body = markdown.markdown(body)

    sections = {
        "h2": {
            "About": "/about",
            "Blog": "/blogs",
            "Library": "/library",
        },
    }

    # Update HTML content with IDs or URLs
    for section_name, section_id in sections["h2"].items():
        # Check if it's an anchor or a URL
        if section_id.startswith("#"):
            html_body = html_body.replace(
                f"<h2>{section_name}</h2>",
                f'<h2 id="{section_id[1:]}">{section_name}</h2>',
            )
        else:
            html_body = html_body.replace(
                f"<h2>{section_name}</h2>",
                f"<h2>{section_name}</h2>",
            )

    html_body = html_body.replace("<h2", "<hr>\n<h2")

    # Generate the navigation bar
    sections_navbar = "|\n".join(
        f'<a href="{anchor}">{section}</a>'
        for sections_heading in sections.values()
        for section, anchor in sections_heading.items()
    )

    html_content = f"""
        <div class="header">
            <div class="logo">
                <img src="{logo_path}" alt="horv.co Logo">
            </div>
            <div class="navbar">
                {sections_navbar}
            </div>
        </div>
        <hr>
        <div class="content">
            {html_body}
        </div>
    """

    html_page = html_utils.get(title, description, keywords, html_content)

    return html_page


def main():
    html = generate_index()

    html_utils.write(html_index_file, html)

    print(f"{html_index_file} has been created successfully!")


if __name__ == "__main__":
    main()
