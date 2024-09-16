from dataclasses import dataclass


@dataclass
class Colors:
    fg: str = "#333"
    bg: str = "#f8f5e9"
    link: str = "#0066cc"
    link_hover: str = "#004080"
    header_bg: str = "transparent"
    navbar_bg: str = "transparent"


@dataclass
class Font:
    family: str = "'Arial', 'Helvetica', sans-serif"
    size: str = "18px"
    line_height: str = "1.2"
    letter_spacing: str = "0.05em"


@dataclass
class TextTransform:
    headings: str = "none"
    navbar: str = "none"
    content: str = "none"


@dataclass
class Spacing:
    content_padding_top: str = "120px"
    content_padding_bottom: str = "500px"
    content_padding_horizontal: str = "20px"
    heading_margin_bottom: str = "20px"
    paragraph_margin_bottom: str = "20px"


@dataclass
class Layout:
    content_max_width: str = "800px"
    offset_percentage: str = "0%"
    header_height: str = "100vh"


@dataclass
class Style:
    text_align: str = "justify"
    hyphens: str = "auto"


@dataclass
class HeaderStyle:
    display: str = "flex"
    flex_direction: str = "column"
    justify_content: str = "center"
    align_items: str = "center"


@dataclass
class NavbarStyle:
    display: str = "flex"
    justify_content: str = "center"
    align_items: str = "center"


@dataclass
class Config:
    colors: Colors = Colors
    font: Font = Font
    text_transform: TextTransform = TextTransform
    spacing: Spacing = Spacing
    layout: Layout = Layout
    style: Style = Style
    header_style: HeaderStyle = HeaderStyle
    navbar_style: NavbarStyle = NavbarStyle


def get(config: Config = Config()):
    return f"""
    body {{
        font-family: {config.font.family};
        line-height: {config.font.line_height};
        font-size: {config.font.size};
        background-color: {config.colors.bg};
        color: {config.colors.fg};
        margin: 0;
        padding: 0;
        letter-spacing: {config.font.letter_spacing};
    }}

    .header {{
        height: {config.layout.header_height};
        display: {config.header_style.display};
        flex-direction: {config.header_style.flex_direction};
        justify-content: {config.header_style.justify_content};
        align-items: {config.header_style.align_items};
        padding: 0 {config.spacing.content_padding_horizontal};
        transform: translateX({config.layout.offset_percentage});
        background-color: {config.colors.header_bg};
    }}

    .logo img {{
        width: 100%;
        height: auto;
        margin-bottom: {config.spacing.heading_margin_bottom};
    }}

    .navbar {{
        display: {config.navbar_style.display};
        justify-content: {config.navbar_style.justify_content};
        align-items: {config.navbar_style.align_items};
        width: 100%;
        background-color: {config.colors.navbar_bg};
    }}

    .navbar a {{
        margin: 0 10px;
        color: {config.colors.link};
        text-decoration: none;
        font-size: 1.1em;
        transition: color 0.3s ease;
        text-transform: {config.text_transform.navbar};
    }}

    .navbar a:hover {{
        color: {config.colors.link_hover};
    }}

    .blog_title {{
        font-size: 3.5em;
        font-weight: bold;
        margin-bottom: {config.spacing.heading_margin_bottom};
        text-align: center;
        text-transform: {config.text_transform.headings};
    }}

    .content {{
        padding: {config.spacing.content_padding_top} {config.spacing.content_padding_horizontal} {config.spacing.content_padding_bottom};
        max-width: {config.layout.content_max_width};
        margin: 0 auto;
        transform: translateX({config.layout.offset_percentage});
    }}

    h1, h2, h3, h4, h5, h6 {{
        margin-bottom: {config.spacing.heading_margin_bottom};
        line-height: 1.1;
        text-transform: {config.text_transform.headings};
    }}

    h1 {{
        font-size: 2.5em;
    }}

    h2 {{
        margin-top: 40px;
        font-size: 2em;
    }}

    p {{
        margin-bottom: {config.spacing.paragraph_margin_bottom};
        text-align: {config.style.text_align};
        hyphens: {config.style.hyphens};
        -webkit-hyphens: {config.style.hyphens};
        -ms-hyphens: {config.style.hyphens};
        text-transform: {config.text_transform.content};
    }}

    a {{
        color: {config.colors.link};
        text-decoration: none;
        transition: color 0.3s ease;
    }}

    a:hover {{
        color: {config.colors.link_hover};
    }}

    @media (max-width: 600px) {{
        body {{
            font-size: 16px;
        }}
        .content {{
            padding: 80px 15px 300px;
        }}
    }}
    """
