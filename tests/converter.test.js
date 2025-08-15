const { convertRichTextToHtml, convertHtmlToDraftJs } = require('../src/index');

describe('Draft.js HTML Converter', () => {
  describe('convertRichTextToHtml', () => {
    test('should handle empty input', () => {
      expect(convertRichTextToHtml(null)).toBe('');
      expect(convertRichTextToHtml(undefined)).toBe('');
      expect(convertRichTextToHtml({})).toBe('');
      expect(convertRichTextToHtml({ blocks: [] })).toBe('');
    });

    test('should convert simple text block', () => {
      const draftContent = {
        blocks: [
          {
            key: 'abc123',
            data: {},
            text: 'Hello World',
            type: 'unstyled',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(draftContent);
      expect(html).toBe('<p>Hello World</p>');
    });

    test('should convert headers', () => {
      const draftContent = {
        blocks: [
          {
            key: 'h1',
            data: {},
            text: 'Header 1',
            type: 'header-one',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          },
          {
            key: 'h2',
            data: {},
            text: 'Header 2',
            type: 'header-two',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(draftContent);
      expect(html).toBe('<h1>Header 1</h1><h2>Header 2</h2>');
    });

    test('should convert bold and italic text', () => {
      const draftContent = {
        blocks: [
          {
            key: 'styled',
            data: {},
            text: 'This is bold and this is italic',
            type: 'unstyled',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: [
              { style: 'BOLD', offset: 8, length: 4 },
              { style: 'ITALIC', offset: 25, length: 6 }
            ]
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(draftContent);
      expect(html).toBe('<p>This is <strong>bold</strong> and this is <em>italic</em></p>');
    });

    test('should convert unordered lists', () => {
      const draftContent = {
        blocks: [
          {
            key: 'li1',
            data: {},
            text: 'First item',
            type: 'unordered-list-item',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          },
          {
            key: 'li2',
            data: {},
            text: 'Second item',
            type: 'unordered-list-item',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(draftContent);
      expect(html).toBe('<ul><li>First item</li><li>Second item</li></ul>');
    });

    test('should convert ordered lists', () => {
      const draftContent = {
        blocks: [
          {
            key: 'oli1',
            data: {},
            text: 'First item',
            type: 'ordered-list-item',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          },
          {
            key: 'oli2',
            data: {},
            text: 'Second item',
            type: 'ordered-list-item',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(draftContent);
      expect(html).toBe('<ol><li>First item</li><li>Second item</li></ol>');
    });

    test('should handle links', () => {
      const draftContent = {
        blocks: [
          {
            key: 'link',
            data: {},
            text: 'Visit Google',
            type: 'unstyled',
            depth: 0,
            entityRanges: [{ key: 0, offset: 6, length: 6 }],
            inlineStyleRanges: []
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
      expect(html).toBe('<p>Visit <a href="https://google.com">Google</a></p>');
    });

    test('should handle text alignment', () => {
      const draftContent = {
        blocks: [
          {
            key: 'center',
            data: { textAlignment: 'center' },
            text: 'Centered text',
            type: 'unstyled',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: []
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(draftContent);
      expect(html).toBe('<p style="text-align: center">Centered text</p>');
    });
  });

  describe('convertHtmlToDraftJs', () => {
    test('should handle empty input', () => {
      const result = convertHtmlToDraftJs('');
      expect(result.blocks).toHaveLength(0);
      expect(result.entityMap).toEqual({});
    });

    test('should convert simple paragraph', () => {
      const html = '<p>Hello World</p>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].text).toBe('Hello World');
      expect(result.blocks[0].type).toBe('unstyled');
    });

    test('should convert headers', () => {
      const html = '<h1>Header 1</h1><h2>Header 2</h2>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(2);
      expect(result.blocks[0].text).toBe('Header 1');
      expect(result.blocks[0].type).toBe('header-one');
      expect(result.blocks[1].text).toBe('Header 2');
      expect(result.blocks[1].type).toBe('header-two');
    });

    test('should convert bold and italic text', () => {
      const html = '<p>This is <strong>bold</strong> and this is <em>italic</em></p>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].text).toBe('This is bold and this is italic');
      expect(result.blocks[0].inlineStyleRanges).toContainEqual({
        style: 'BOLD',
        offset: 8,
        length: 4
      });
      expect(result.blocks[0].inlineStyleRanges).toContainEqual({
        style: 'ITALIC',
        offset: 25,
        length: 6
      });
    });

    test('should convert unordered lists', () => {
      const html = '<ul><li>First item</li><li>Second item</li></ul>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(2);
      expect(result.blocks[0].text).toBe('First item');
      expect(result.blocks[0].type).toBe('unordered-list-item');
      expect(result.blocks[1].text).toBe('Second item');
      expect(result.blocks[1].type).toBe('unordered-list-item');
    });

    test('should convert ordered lists', () => {
      const html = '<ol><li>First item</li><li>Second item</li></ol>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(2);
      expect(result.blocks[0].text).toBe('First item');
      expect(result.blocks[0].type).toBe('ordered-list-item');
      expect(result.blocks[1].text).toBe('Second item');
      expect(result.blocks[1].type).toBe('ordered-list-item');
    });

    test('should handle links', () => {
      const html = '<p>Visit <a href="https://google.com">Google</a></p>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].text).toBe('Visit Google');
      expect(result.blocks[0].entityRanges).toHaveLength(1);
      expect(result.blocks[0].entityRanges[0]).toEqual({
        key: 0,
        offset: 6,
        length: 6
      });
      expect(result.entityMap[0]).toEqual({
        type: 'CUSTOM',
        mutability: 'MUTABLE',
        data: { url: 'https://google.com' }
      });
    });

    test('should handle text alignment', () => {
      const html = '<p style="text-align: center">Centered text</p>';
      const result = convertHtmlToDraftJs(html);
      
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].text).toBe('Centered text');
      expect(result.blocks[0].data).toEqual({ textAlignment: 'center' });
    });
  });

  describe('Round-trip conversion', () => {
    test('should maintain content through round-trip conversion', () => {
      const originalDraft = {
        blocks: [
          {
            key: 'test1',
            data: {},
            text: 'This is bold and italic text',
            type: 'unstyled',
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: [
              { style: 'BOLD', offset: 8, length: 4 },
              { style: 'ITALIC', offset: 17, length: 6 }
            ]
          }
        ],
        entityMap: {}
      };

      const html = convertRichTextToHtml(originalDraft);
      const backToDraft = convertHtmlToDraftJs(html);
      
      expect(backToDraft.blocks[0].text).toBe(originalDraft.blocks[0].text);
      expect(backToDraft.blocks[0].type).toBe(originalDraft.blocks[0].type);
      expect(backToDraft.blocks[0].inlineStyleRanges).toHaveLength(2);
    });
  });
});
