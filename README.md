# Draft.js HTML Converter

[![npm version](https://badge.fury.io/js/draft-js-html-converter.svg)](https://www.npmjs.com/package/draft-js-html-converter)
[![GitHub license](https://img.shields.io/github/license/amr258144/draft-js-html-converter.svg)](https://github.com/amr258144/draft-js-html-converter/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/amr258144/draft-js-html-converter.svg)](https://github.com/amr258144/draft-js-html-converter/issues)
[![GitHub stars](https://img.shields.io/github/stars/amr258144/draft-js-html-converter.svg)](https://github.com/amr258144/draft-js-html-converter/stargazers)

A lightweight, zero-dependency library for converting between Draft.js rich text format and HTML.

## Table of Contents

- [Why Choose This Library?](#why-choose-this-library)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Supported Features](#supported-features)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Browser Support](#browser-support)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Related Projects](#related-projects)
- [Changelog](#changelog)
- [License](#license)

## Why Choose This Library?

- 🚀 **Zero dependencies** - No bloat, just pure JavaScript
- 📦 **Lightweight** - Less than 15KB minified
- ⚡ **Fast** - Optimized for performance
- 🔄 **Bidirectional** - Perfect round-trip conversion
- 🧪 **Well tested** - 95%+ test coverage
- 📘 **TypeScript ready** - Full type definitions included

## Installation

```bash
# npm
npm install draft-js-html-converter

# yarn
yarn add draft-js-html-converter

# pnpm
pnpm add draft-js-html-converter
```

## Quick Start

```javascript
const { convertRichTextToHtml, convertHtmlToDraftJs } = require('draft-js-html-converter');

// Draft.js to HTML
const html = convertRichTextToHtml(draftContent);

// HTML to Draft.js  
const draftContent = convertHtmlToDraftJs('<p><strong>Hello</strong> World</p>');
```

## Features

- ✅ Convert Draft.js content to clean HTML
- ✅ Convert HTML back to Draft.js format
- ✅ Support for all common formatting (bold, italic, underline, headers, lists, links, colors, font sizes)
- ✅ Proper handling of nested styles and entities
- ✅ Text alignment support
- ✅ Zero dependencies
- ✅ TypeScript support
- ✅ Comprehensive test coverage
- ✅ Round-trip conversion support

## Usage

### Converting Draft.js to HTML

```javascript
const { convertRichTextToHtml } = require('draft-js-html-converter');

const draftContent = {
  blocks: [
    {
      key: 'abc123',
      data: {},
      text: 'Hello World',
      type: 'unstyled',
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [
        { style: 'BOLD', offset: 0, length: 5 }
      ]
    }
  ],
  entityMap: {}
};

const html = convertRichTextToHtml(draftContent);
console.log(html); // '<p><strong>Hello</strong> World</p>'
```

### Converting HTML to Draft.js

```javascript
const { convertHtmlToDraftJs } = require('draft-js-html-converter');

const html = '<p><strong>Hello</strong> World</p>';
const draftContent = convertHtmlToDraftJs(html);

console.log(draftContent);
// {
//   blocks: [
//     {
//       key: 'generated-key',
//       data: {},
//       text: 'Hello World',
//       type: 'unstyled',
//       depth: 0,
//       entityRanges: [],
//       inlineStyleRanges: [
//         { style: 'BOLD', offset: 0, length: 5 }
//       ]
//     }
//   ],
//   entityMap: {}
// }
```

### ES6 Imports

```javascript
import { convertRichTextToHtml, convertHtmlToDraftJs } from 'draft-js-html-converter';

// or

import converter from 'draft-js-html-converter';
const html = converter.convertRichTextToHtml(draftContent);
```

## API Reference

### convertRichTextToHtml(richTextContent)

Converts Draft.js content to HTML string.

**Parameters:**
- `richTextContent` (Object): Draft.js content state object

**Returns:**
- `string`: HTML representation of the content

### convertHtmlToDraftJs(htmlContent)

Converts HTML string to Draft.js content format.

**Parameters:**
- `htmlContent` (string): HTML content to convert

**Returns:**
- `Object`: Draft.js content state object with `blocks` and `entityMap`

## Supported Features

### Block Types
- `unstyled` → `<p>`
- `header-one` → `<h1>`
- `header-two` → `<h2>`
- `header-three` → `<h3>`
- `unordered-list-item` → `<ul><li>`
- `ordered-list-item` → `<ol><li>`
- `blockquote` → `<blockquote>`
- `code-block` → `<pre>`

### Inline Styles
- `BOLD` → `<strong>`
- `ITALIC` → `<em>`
- `UNDERLINE` → `<u>`
- `FONT_SIZE_SMALL` → `<span style="font-size: small">`
- `FONT_SIZE_NORMAL` → `<span style="font-size: medium">`
- `FONT_SIZE_LARGE` → `<span style="font-size: large">`
- `FONT_SIZE_HUGE` → `<span style="font-size: x-large">`

### Entities
- Links: `{ type: 'CUSTOM', data: { url: '...' } }` → `<a href="...">`
- Colors: `{ type: 'CUSTOM', data: { color: '...' } }` → `<span style="color: ...">`

### Block Data
- Text alignment: `{ textAlignment: 'center' }` → `style="text-align: center"`

## Examples

🔗 **[Try it online](https://codesandbox.io/s/draft-js-html-converter-demo)** (CodeSandbox)

### Complex Content with Multiple Styles

```javascript
const complexDraft = {
  blocks: [
    {
      key: 'header',
      data: { textAlignment: 'center' },
      text: 'Welcome to My Blog',
      type: 'header-one',
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: []
    },
    {
      key: 'intro',
      data: {},
      text: 'This is an introduction with bold text and a link to Google.',
      type: 'unstyled',
      depth: 0,
      entityRanges: [{ key: 0, offset: 53, length: 6 }],
      inlineStyleRanges: [{ style: 'BOLD', offset: 29, length: 4 }]
    },
    {
      key: 'list1',
      data: {},
      text: 'First item',
      type: 'unordered-list-item',
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: []
    },
    {
      key: 'list2',
      data: {},
      text: 'Second item with italic text',
      type: 'unordered-list-item',
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [{ style: 'ITALIC', offset: 17, length: 6 }]
    }
  ],
  entityMap: {
    0: {
      type: 'CUSTOM',
      mutability: 'MUTABLE',
      data: { url: 'https://google.com' }
    }
  }
};

const html = convertRichTextToHtml(complexDraft);
console.log(html);
// Output:
// <h1 style="text-align: center">Welcome to My Blog</h1>
// <p>This is an introduction with <strong>bold</strong> text and a link to <a href="https://google.com">Google</a>.</p>
// <ul>
//   <li>First item</li>
//   <li>Second item with <em>italic</em> text</li>
// </ul>
```

### Round-trip Conversion

```javascript
// Start with HTML
const originalHtml = `
  <h1>My Article</h1>
  <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
`;

// Convert to Draft.js
const draftContent = convertHtmlToDraftJs(originalHtml);

// Convert back to HTML
const finalHtml = convertRichTextToHtml(draftContent);

// The content is preserved through the round-trip
console.log(finalHtml);
```

## Error Handling

The library includes robust error handling:

- Invalid or malformed input returns safe fallback values
- HTML parsing errors are caught and logged
- Malformed Draft.js content falls back to JSON string representation

```javascript
// These all handle gracefully
convertRichTextToHtml(null); // returns ''
convertRichTextToHtml({}); // returns ''
convertHtmlToDraftJs(''); // returns { blocks: [], entityMap: {} }
convertHtmlToDraftJs('<invalid>html'); // returns safe fallback structure
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Node.js 12+

## Testing

Run the test suite:

```bash
npm test
```

The library includes comprehensive tests covering:
- All supported block types and inline styles
- Entity handling (links, colors)
- Edge cases and error conditions
- Round-trip conversion accuracy
- Malformed input handling

## Troubleshooting

### Common Issues

**Q: My inline styles aren't converting correctly**
A: Check that your `offset` and `length` values in `inlineStyleRanges` match the actual text positions.

**Q: Links aren't working**
A: Ensure your entity has `type: 'CUSTOM'` and `data: { url: '...' }`.

**Q: Getting empty output**
A: Verify your Draft.js content has the correct structure with `blocks` and `entityMap`.

### Need Help?

- 📖 [Check the examples](./examples/)
- 🐛 [Report a bug](https://github.com/amr258144/draft-js-html-converter/issues)
- 💬 [Ask a question](https://github.com/amr258144/draft-js-html-converter/discussions)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Related Projects

- [Draft.js](https://draftjs.org/) - Rich text editor framework
- [draft-js-export-html](https://github.com/sstur/draft-js-export-html) - Alternative HTML export (Draft.js → HTML only)
- [draft-js-import-html](https://github.com/sstur/draft-js-import-html) - Alternative HTML import (HTML → Draft.js only)

**Why choose draft-js-html-converter?** Bidirectional conversion, zero dependencies, and comprehensive feature support in one package.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
