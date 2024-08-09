import sys
from pathlib import Path

import minify_html


def html(directory):
    for file_path in Path(directory).rglob("*.html"):
        print(f"Minifying {file_path}...")
        with open(file_path, "r", encoding="utf-8") as file:
            html_content = file.read()

        minified_html = minify_html.minify(
            html_content,
            minify_js=True,
            remove_processing_instructions=True,
        )

        with open(file_path, "w", encoding="utf-8") as file:
            file.write(minified_html)


def main():
    # Directory to process (current directory by default)
    directory = sys.argv[1] if len(sys.argv) > 1 else "."

    html(directory)

    print("Minification complete.")


if __name__ == "__main__":
    main()
