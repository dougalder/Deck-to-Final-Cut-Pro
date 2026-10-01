# Changelog

All notable changes to this project are listed here. Dates are YYYY-MM-DD.

## 1.0.0 — 2026-10-01

First public release.

- Converts PowerPoint (.pptx) and Markdown (.md) files into a Final Cut Pro project (.fcpxml) packaged with its media in a .zip.
- Text becomes editable Basic Title clips, with font, size, color and position carried over and wrapped to each text box's width.
- Slide backgrounds become clips on the primary storyline; pictures and filled shapes become layers above them; text from master slides is optional.
- Speaker notes become markers or a disabled script lane; sections become chapter markers; anything that can't be converted gets a red to-do marker.
- Timing: fixed length, from the length of the notes, or the deck's own timings, with per-slide lengths set in the timeline.
- Font handling: lists every font in the deck, replaces fonts that aren't on every Mac, and remembers fonts you've installed.
- Live timeline preview, slide preview and slide details.
- Runs entirely in the browser and works offline; the page can save a copy of itself.
- Light and dark mode.
