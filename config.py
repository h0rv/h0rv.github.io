from dataclasses import dataclass

input_dir = "content"
output_dir = "public"


@dataclass
class Config:

    @dataclass
    class Markdown:
        index = f"{input_dir}/index.md"
        blogs_input_dir = f"{input_dir}/blogs"
        about = f"{input_dir}/about.md"
        library = f"{input_dir}/library.md"

    @dataclass
    class HTML:
        index = f"{output_dir}/index.html"
        blogs_output_dir = f"{output_dir}/blogs"
        blogs_index = f"{output_dir}/blogs/index.html"
        about = f"{output_dir}/about/index.html"
        library = f"{output_dir}/library/index.html"
