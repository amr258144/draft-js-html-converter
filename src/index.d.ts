export interface DraftJSBlock {
  key: string;
  data: any;
  text: string;
  type: string;
  depth: number;
  entityRanges: EntityRange[];
  inlineStyleRanges: InlineStyleRange[];
}

export interface EntityRange {
  key: number;
  offset: number;
  length: number;
}

export interface InlineStyleRange {
  style: string;
  offset: number;
  length: number;
}

export interface DraftJSEntity {
  type: string;
  mutability: string;
  data: any;
}

export interface DraftJSContent {
  blocks: DraftJSBlock[];
  entityMap: { [key: string]: DraftJSEntity };
}

/**
 * Convert Draft.js rich text content to HTML
 * @param richTextContent - The richtext content in Draft.js format
 * @returns The HTML representation of the content
 */
export function convertRichTextToHtml(richTextContent: DraftJSContent): string;

/**
 * Convert HTML content to Draft.js format
 * @param htmlContent - The HTML content
 * @returns The Draft.js representation of the content
 */
export function convertHtmlToDraftJs(htmlContent: string): DraftJSContent;

declare const _default: {
  convertRichTextToHtml: typeof convertRichTextToHtml;
  convertHtmlToDraftJs: typeof convertHtmlToDraftJs;
};

export default _default;
