# `philly` CLI and Python Library
2026-02-01

The `philly` CLI and Python library is a toolkit for exploring and working with [OpenDataPhilly](https://opendataphilly.org/) datasets and data.

The motivation behind the project was sparked by moving to Philadelphia the past summer and wanted to get involved in the tech community and make a project related to the city. Additionally, at the time Claude Code was really starting to take off when tool calling got very good with the release of Sonnet 4.

After discovering OpenDataPhilly datasets, there was no efficient way to explore the data without navigating to all the sources and sifting through hundreds of pages of all different data types and sources. Due to this, the goal of this project was to improve the experience for both humans and AI agents to explore and and leverage the data. It provides both meta tools for discovering and finding datasets themselves, then common utilities for downloading, streaming, and querying different sources in a convient manner and API.

For not being a data scientist, doing any sort of data exploration and analysis without coding agent assistant would not be possible without a much more significant time investment. Also, LLMs are exceptional at pattern matching and crunching through large amounts of data compared to humans. This tool simply gives them a better interface for doing such.

The source code is available [here](https://github.com/h0rv/philly) and none of this would be possible without the long and continued work from the OpenDataPhilly team.
