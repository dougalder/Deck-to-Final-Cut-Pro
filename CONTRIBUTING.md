# Contributing

Thanks for helping improve Deck to Final Cut Pro. Bug reports, sample files that convert badly, and pull requests are all welcome.

## Reporting a problem

Open an issue and include:

- what you expected and what you got, with a screenshot of the timeline in Final Cut Pro if you can
- your Final Cut Pro version, macOS version and browser
- if you can share it, a small `.pptx` or `.md` file that shows the problem. Strip out anything private first, and only attach files you have the right to share

## How the project is organized

The whole app is one file, `index.html`, so it can be saved and run offline. There's no build step.

```
index.html               the app: markup, styles and two scripts
examples/sourdough.md    a sample Markdown script
docs/MANUAL.md           the user manual
docs/*.png               screenshots used in the README
tools/smoke-test.mjs     a command-line test of the conversion core
```

Inside `index.html`:

1. **JSZip**, inlined and minified, in the first `<script>` in `<head>`.
2. **The core** (`const Core = …`). This is plain JavaScript with no DOM dependencies beyond an XML parser passed in. It has four stages:
   - `parsePptx(buffer, JSZip, parseXml, fileName)` and `parseMarkdown(text, imagePool)` read a source into a common document model: segments with blocks of styled paragraphs, positioned images and shapes, notes, sections and to-do items.
   - `makePlan(doc, settings)` turns the document into a timeline plan: segment lengths, background clips, image and shape layers, titles with positions and wrapped text, markers and fonts.
   - `buildFcpxml(plan, files, settings)` writes the FCPXML text.
3. **The UI script**. It handles loading files, settings, the timeline view, the slide preview, rendering media to PNGs with `<canvas>`, building the zip, and saving preferences.

### Units worth knowing

- PowerPoint geometry is read in EMUs and stored as fractions of the slide (0 to 1).
- Title `Position` and `fontSize` are written in Final Cut Pro's units for a 1080-line frame, centered on the frame. These were confirmed by importing a test project into Final Cut Pro.
- A Basic Title's position is the first line's baseline, so text blocks are placed by computing the top of the block from its anchor (top, middle or bottom) and adding about 0.9 of a line.

### The "Save this page" button

The button rebuilds the page from the elements in `<head>` and `<body>` that carry a `data-d2f` attribute, captured before the page changes anything. **If you add a new top-level element to `<head>` or `<body>`, give it a `data-d2f` attribute**, or it won't be included in saved copies.

## Testing

You need [Node.js](https://nodejs.org) 18 or later.

```sh
npm install                               # installs the dev dependencies: jszip and @xmldom/xmldom
npm test                                  # converts examples/sourdough.md
node tools/smoke-test.mjs path/to/deck.pptx
```

The smoke test extracts the core from `index.html`, converts the file, prints a summary, and checks that the FCPXML is well formed. It doesn't render media or build the zip, which only happen in the browser.

Before opening a pull request, please also:

1. Open `index.html` in Safari and in one other browser, load a `.pptx` and a `.md`, and check the timeline and slide preview.
2. Download the zip, import it into Final Cut Pro, and check that titles land where the preview shows them.
3. Check the page in light and dark mode, and at a narrow width.
4. Turn off Wi-Fi, open a copy made with **Save this page**, and convert a file.

## Guidelines

- **Keep it one file and offline.** Don't add network requests, analytics or external scripts. Any new library must be small, permissively licensed, inlined, and listed in `THIRD-PARTY-NOTICES.md` and the README.
- **Keep files private.** Nothing a user loads may leave the browser.
- **Support Safari.** Safari on macOS is the main target, along with Safari on iPad and iPhone, and current Chrome, Edge and Firefox.
- **Prefer to-do markers to silent loss.** When something can't be converted, add it to the segment's `omitted` list so it becomes a to-do marker.
- **Update the docs.** If you change a setting, update `docs/MANUAL.md`, and add a line to `CHANGELOG.md`.

## Updating JSZip

1. Download the new `dist/jszip.min.js` from the [JSZip releases](https://github.com/Stuk/jszip/releases).
2. Replace the contents of the first `<script data-d2f>` in `<head>`, escaping any `</script` in the library as `<\/script`.
3. Update the version in `package.json`, `README.md` and `THIRD-PARTY-NOTICES.md`.

## License

By contributing, you agree that your contributions are released under the project's [MIT License](LICENSE).
