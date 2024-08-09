from dataclasses import dataclass


@dataclass
class Colors:
    fg = "#333"
    bg = "#f8f5e9"  # Eggshell/light cream

    """
    palette from
        https://github.com/jesseleite/nvim-noirbuddy/blob/master/lua/noirbuddy/presets/northern-lights.lua
    """
    # fg = "#FAF3E0"
    # bg = '#131313'
    # green = '#A3BE8C'
    # blue = '#8FBCBB'
    # red = '#BF616A'
    # yellow = '#EBCB8B'
    # purple = '#B48EAD'
    # orange = '#D08770'


@dataclass
class Font:
    size = "16px"
    line_height = "1.6"
    # family = "sans-serif"
    # family = "Arial, sans-serif"
    # family = "'Courier New', Courier, monospace"
    # family = "'Merriweather', Georgia, serif"
    family = "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif"
    # family = "'Fira Code', 'Consolas', monospace"


def get():
    return f"""
    body {{
        font-family: {Font.family};
        line-height: {Font.line_height};
        font-size: {Font.size};
        background-color: {Colors.bg};
        color: {Colors.fg};
        margin: 0;
        padding: 0;
    }}

    .header {{
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0 20px; /* Add some horizontal padding */
    }}

    .logo img {{
        width: 100%;
        height: auto;
        margin-bottom: 0px;
    }}

    .navbar {{
        display: flex;
        justify-content: center;
        align-items: center;
    }}

    .navbar a {{
        margin: 0 10px;
        color: {Colors.fg};
        text-decoration: none;
        font-size: 1.1em;
    }}

    .navbar a:hover {{
        text-decoration: underline;
    }}

    .blog_title {{
        font-size: 3.0em;
        font-weight: bold;
    }}

    .content {{
        padding: 120px 20px;
        max-width: 800px;
        margin: 0 auto;
        padding-bottom: 500px; /* Add extra padding at the bottom */
    }}

    h1, h2 {{
        margin-bottom: 20px;
    }}

    h2 {{
        margin-top: 80px;
    }}
    """
