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
        metadata = yaml.safe_load(front_matter)
    else:
        metadata = {}

    title = metadata.get("title")
    description = metadata.get("description")
    keywords = metadata.get("keywords")
    logo_path = metadata.get("logo_path")

    sections = {
        "h2": {
            "About": "/about",
            "Blog": "/blogs",
            "Library": "/library",
        },
    }

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
    """

    html_page = html_utils.get(title, description, keywords, html_content)

    return html_page


def main():
    html = generate_index()

    html_utils.write(html_index_file, html)

    print(f"{html_index_file} has been created successfully!")


if __name__ == "__main__":
    main()
