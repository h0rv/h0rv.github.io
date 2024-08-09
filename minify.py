import sys
from pathlib import Path

import minify_html


def html(directory):
    for file_path in Path(directory).rglob("*.html"):
        print(f"Minifying {file_path}...")
        with open(file_path, "r", encoding="utf-8") as file:
            html_content = file.read()

        # full list of opts: https://github.com/wilsonzlin/minify-html/blob/master/minify-html-python/minify_html.pyi
        minified_html = minify_html.minify(
            html_content,
            allow_noncompliant_unquoted_attribute_values=False,
            allow_optimal_entities=False,
            allow_removing_spaces_between_attributes=True,
            keep_closing_tags=False,
            keep_comments=False,
            keep_html_and_head_opening_tags=False,
            keep_input_type_text_attr=False,
            keep_ssi_comments=False,
            minify_css=True,
            minify_doctype=False,
            minify_js=True,
            preserve_brace_template_syntax=False,
            preserve_chevron_percent_template_syntax=False,
            remove_bangs=False,
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
