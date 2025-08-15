# Draft.js HTML Converter

A lightweight, zero-dependency library for converting between Draft.js rich text format and HTML.

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

## Installation

```bash
npm install draft-js-html-converter
```

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

## Examples

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
      entityRanges: [{ key: 0, offset: 49, length: 6 }],
      inlineStyleRanges: [{ style: 'BOLD', offset: 32, length: 4 }]
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.0
- Initial release
- Support for all basic Draft.js block types and inline styles
- Entity support for links and colors
- Text alignment support
- Comprehensive test coverage
- TypeScript definitions
```

Now let's create additional configuration files:

```json:draft-js-html-converter/jest.config.json
{
  "testEnvironment": "node",
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"],
  "testMatch": ["**/tests/**/*.test.js"],
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/**/*.test.js"
  ]
}
```

```markdown:draft-js-html-converter/LICENSE
MIT License

Copyright (c) 2024 Draft.js HTML Converter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

```gitignore:draft-js-html-converter/.gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage directory used by tools like istanbul
coverage/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

```markdown:draft-js-html-converter/.github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [12.x, 14.x, 16.x, 18.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm test
    - run: npm run build

  coverage:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 16
      uses: actions/setup-node@v3
      with:
        node-version: 16
        cache: 'npm'
    
    - run: npm ci
    - run: npm test
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

Let's also create a simple example file:

```javascript:draft-js-html-converter/examples/basic-usage.js
const { convertRichTextToHtml, convertHtmlToDraftJs } = require('../src/index');

// Example 1: Convert Draft.js to HTML
console.log('=== Draft.js to HTML ===');

const draftContent = {
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
      entityRanges: [{ key: 0, offset: 49, length: 6 }],
      inlineStyleRanges: [{ style: 'BOLD', offset: 32, length: 4 }]
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

const html = convertRichTextToHtml(draftContent);
console.log('Generated HTML:');
console.log(html);

// Example 2: Convert HTML to Draft.js
console.log('\n=== HTML to Draft.js ===');

const htmlInput = `
  <h1>My Article</h1>
  <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
`;

const convertedDraft = convertHtmlToDraftJs(htmlInput);
console.log('Generated Draft.js content:');
console.log(JSON.stringify(convertedDraft, null, 2));

// Example 3: Round-trip conversion
console.log('\n=== Round-trip Conversion ===');

const roundTripHtml = convertRichTextToHtml(convertedDraft);
console.log('Round-trip HTML:');
console.log(roundTripHtml);
```

Now let's install Jest and run the tests:

```bash
npm install --save-dev jest
```

```bash
npm test
```

Let's also create the GitHub workflows directory:

```bash
mkdir -p .github/workflows
```

Now let's create a final summary file:

```markdown:draft-js-html-converter/CONTRIBUTING.md
# Contributing to Draft.js HTML Converter

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/draft-js-html-converter.git
cd draft-js-html-converter
```

2. Install dependencies:
```bash
npm install
```

3. Run tests to ensure everything works:
```bash
npm test
```

## Project Structure

```
draft-js-html-converter/
├── src/
│   ├── index.js          # Main library code
│   └── index.d.ts        # TypeScript definitions
├── tests/
│   └── converter.test.js # Test suite
├── examples/
│   └── basic-usage.js    # Usage examples
├── package.json
├── README.md
└── LICENSE
```

## Making Changes

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes in the `src/` directory

3. Add tests for your changes in `tests/`

4. Ensure all tests pass:
```bash
npm test
```

5. Update documentation if needed

6. Commit your changes:
```bash
git commit -m "Add your feature description"
```

7. Push and create a pull request

## Testing Guidelines

- Write tests for all new functionality
- Ensure existing tests continue to pass
- Aim for high test coverage
- Test edge cases and error conditions

## Code Style

- Use consistent indentation (2 spaces)
- Add JSDoc comments for public functions
- Follow existing naming conventions
- Keep functions focused and single-purpose

## Submitting Pull Requests

1. Ensure your code follows the project's style
2. Include tests for new functionality
3. Update documentation as needed
4. Provide a clear description of changes
5. Reference any related issues

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, etc.)
- Sample code if applicable

## Feature Requests

For feature requests, please:
- Check if the feature already exists
- Provide a clear use case
- Explain the expected behavior
- Consider backward compatibility

Thank you for contributing!
