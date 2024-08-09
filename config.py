from dataclasses import dataclass


@dataclass
class Config:

    @dataclass
    class Markdown:
        input_dir = "content"
        index = "content/index.md"
        blogs_input_dir = "content/blogs"

    @dataclass
    class HTML:
        output_dir = "public"
        index = "public/index.html"
        blogs_output_dir = "public/blogs"
        blogs_index = "public/blogs/index.html"
