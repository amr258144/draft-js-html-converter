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
