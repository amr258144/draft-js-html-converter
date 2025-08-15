/**
 * Draft.js HTML Converter
 * A lightweight library for converting between Draft.js rich text format and HTML
 */

/**
 * Convert Draft.js rich text content to HTML
 * @param {Object} richTextContent - The richtext content in Draft.js format
 * @returns {string} - The HTML representation of the content
 */
function convertRichTextToHtml(richTextContent) {
    try {
        if (!richTextContent || !richTextContent.blocks) {
            return '';
        }

        let entityMap = [];
        if (Array.isArray(richTextContent.entityMap)) {
            richTextContent.entityMap.forEach((entity, index) => {
                entityMap[index] = entity;
            });
        } else {
            entityMap = richTextContent.entityMap || [];
        }

        const { blocks } = richTextContent;
        let html = '';
        
        // Track list context to properly wrap list items
        let inOrderedList = false;
        let inUnorderedList = false;
        let currentListHtml = '';

        blocks.forEach((block, index) => {
            const { text, type, data = {}, inlineStyleRanges = [], entityRanges = [] } = block;
            
            // Handle list items specially to group them
            if (type === 'ordered-list-item' || type === 'unordered-list-item') {
                const isOrdered = type === 'ordered-list-item';
                
                // Start a new list if needed
                if ((isOrdered && !inOrderedList) || (!isOrdered && !inUnorderedList)) {
                    // Close any previous list
                    if (inOrderedList) {
                        html += `<ol>${currentListHtml}</ol>`;
                        currentListHtml = '';
                        inOrderedList = false;
                    } else if (inUnorderedList) {
                        html += `<ul>${currentListHtml}</ul>`;
                        currentListHtml = '';
                        inUnorderedList = false;
                    }
                    
                    // Start new list
                    if (isOrdered) {
                        inOrderedList = true;
                    } else {
                        inUnorderedList = true;
                    }
                }
                
                // Process the list item content
                const blockHtml = processBlockContent(text, inlineStyleRanges, entityRanges, entityMap);
                // Add text alignment if specified
                const alignStyle = data.textAlignment ? ` style="text-align: ${data.textAlignment}"` : '';
                currentListHtml += `<li${alignStyle}>${blockHtml}</li>`;
                
                // Check if this is the last block or if the next block is not a list item
                const isLastBlock = index === blocks.length - 1;
                const nextBlockIsDifferentList = !isLastBlock && 
                    (blocks[index + 1].type !== type);
                
                if (isLastBlock || nextBlockIsDifferentList) {
                    // Close the current list
                    if (inOrderedList) {
                        html += `<ol>${currentListHtml}</ol>`;
                        currentListHtml = '';
                        inOrderedList = false;
                    } else if (inUnorderedList) {
                        html += `<ul>${currentListHtml}</ul>`;
                        currentListHtml = '';
                        inUnorderedList = false;
                    }
                }
                
                return; // Skip the regular block processing
            }
            
            // Close any open list before processing non-list blocks
            if (inOrderedList) {
                html += `<ol>${currentListHtml}</ol>`;
                currentListHtml = '';
                inOrderedList = false;
            } else if (inUnorderedList) {
                html += `<ul>${currentListHtml}</ul>`;
                currentListHtml = '';
                inUnorderedList = false;
            }
            
            // Process regular blocks
            const blockHtml = processBlockContent(text, inlineStyleRanges, entityRanges, entityMap);
            
            // Wrap in block-level element with alignment if specified
            const blockTag = getBlockTag(type);
            const alignStyle = data.textAlignment ? ` style="text-align: ${data.textAlignment}"` : '';
            html += `<${blockTag}${alignStyle}>${blockHtml}</${blockTag}>`;
        });
        
        // Close any remaining list
        if (inOrderedList) {
            html += `<ol>${currentListHtml}</ol>`;
        } else if (inUnorderedList) {
            html += `<ul>${currentListHtml}</ul>`;
        }

        return html;
    } catch (error) {
        console.error("Error converting richtext to HTML:", error);
        return JSON.stringify(richTextContent);
    }
}

/**
 * Process the content of a block with its styles and entities
 * @private
 */
function processBlockContent(text, inlineStyleRanges, entityRanges, entityMap) {
    // Create an array to track styling at each character position
    const charStyles = new Array(text.length).fill(null).map(() => new Set());
    const charEntities = new Array(text.length).fill(null);

    // Apply inline styles
    inlineStyleRanges.forEach(range => {
        for (let i = range.offset; i < range.offset + range.length; i++) {
            if (charStyles[i]) {
                charStyles[i].add(range.style);
            }
        }
    });

    // Apply entities
    entityRanges.forEach(range => {
        const entity = entityMap[range.key];
        for (let i = range.offset; i < range.offset + range.length; i++) {
            charEntities[i] = entity;
        }
    });

    // Build the HTML for this block
    let blockHtml = '';
    let currentStyles = new Set();
    let currentEntity = null;
    let openTags = [];

    for (let i = 0; i <= text.length; i++) {
        const char = text[i];
        const styles = i < text.length ? charStyles[i] : new Set();
        const entity = i < text.length ? charEntities[i] : null;

        // Close entity if it changes
        if (currentEntity && currentEntity !== entity) {
            if (currentEntity.type === 'LINK' || (currentEntity.type === 'CUSTOM' && currentEntity.data && currentEntity.data.url)) {
                blockHtml += '</a>';
            } else if (currentEntity.type === 'CUSTOM' && currentEntity.data && currentEntity.data.color) {
                blockHtml += '</span>';
            }
            currentEntity = null;
        }

        // Close styles that are no longer active
        const stylesToClose = [...currentStyles].filter(style => !styles.has(style));
        if (stylesToClose.length > 0) {
            const tagsToClose = [];
            for (let j = openTags.length - 1; j >= 0; j--) {
                const tag = openTags[j];
                const style = [...currentStyles].find(s => getStyleTag(s) === tag);
                if (style && stylesToClose.includes(style)) {
                    tagsToClose.push({ tag, style });
                    openTags.splice(j, 1);
                    currentStyles.delete(style);
                }
            }
            
            for (let j = 0; j < tagsToClose.length; j++) {
                blockHtml += `</${tagsToClose[j].tag}>`;
            }
        }

        // Open new styles
        const stylesToOpen = [...styles].filter(style => !currentStyles.has(style));
        stylesToOpen.forEach(style => {
            const tag = getStyleTag(style);
            if (tag) {
                if (style === 'FONT_SIZE_SMALL') {
                    blockHtml += '<span style="font-size: small">';
                } else if (style === 'FONT_SIZE_NORMAL') {
                    blockHtml += '<span style="font-size: medium">';
                } else if (style === 'FONT_SIZE_LARGE') {
                    blockHtml += '<span style="font-size: large">';
                } else if (style === 'FONT_SIZE_HUGE') {
                    blockHtml += '<span style="font-size: x-large">';
                } else {
                    blockHtml += `<${tag}>`;
                }
                openTags.push(tag);
                currentStyles.add(style);
            }
        });

        // Open entity if it changes
        if (entity && entity !== currentEntity) {
            if (entity.type === 'LINK' || (entity.type === 'CUSTOM' && entity.data && entity.data.url)) {
                const url = entity.data.url || '#';
                blockHtml += `<a href="${url}">`;
            } else if (entity.type === 'CUSTOM' && entity.data && entity.data.color) {
                blockHtml += `<span style="color: ${entity.data.color}">`;
            }
            currentEntity = entity;
        }

        // Add the character
        if (char !== undefined) {
            blockHtml += char;
        }
    }

    // Close any remaining open tags in reverse order
    for (let i = openTags.length - 1; i >= 0; i--) {
        blockHtml += `</${openTags[i]}>`;
    }

    // Close any remaining entity
    if (currentEntity) {
        if (currentEntity.type === 'LINK' || (currentEntity.type === 'CUSTOM' && currentEntity.data && currentEntity.data.url)) {
            blockHtml += '</a>';
        } else if (currentEntity.type === 'CUSTOM' && currentEntity.data && currentEntity.data.color) {
            blockHtml += '</span>';
        }
    }
    
    return blockHtml;
}

/**
 * Convert HTML content to Draft.js format
 * @param {string} htmlContent - The HTML content
 * @returns {Object} - The Draft.js representation of the content
 */
function convertHtmlToDraftJs(htmlContent) {
    try {
        const blocks = [];
        const entityMap = {};
        let entityCounter = 0;
        
        // Track the positions of all blocks to maintain order
        const blockPositions = [];
        
        // Process ordered lists
        const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
        let olMatch;
        while ((olMatch = olRegex.exec(htmlContent)) !== null) {
            const listContent = olMatch[1];
            const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let liMatch;
            
            while ((liMatch = liRegex.exec(listContent)) !== null) {
                const content = liMatch[1];
                const { text, inlineStyleRanges, entityRanges } = parseInlineContent(content, entityMap, entityCounter);
                entityCounter += entityRanges.length;
                
                const absolutePosition = olMatch.index + liMatch.index;
                
                blockPositions.push({
                    position: absolutePosition,
                    block: {
                        key: generateBlockKey(),
                        data: [],
                        text: text,
                        type: 'ordered-list-item',
                        depth: 0,
                        entityRanges: entityRanges,
                        inlineStyleRanges: inlineStyleRanges
                    }
                });
            }
        }
        
        // Process unordered lists
        const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
        let ulMatch;
        while ((ulMatch = ulRegex.exec(htmlContent)) !== null) {
            const listContent = ulMatch[1];
            const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let liMatch;
            
            while ((liMatch = liRegex.exec(listContent)) !== null) {
                const content = liMatch[1];
                const { text, inlineStyleRanges, entityRanges } = parseInlineContent(content, entityMap, entityCounter);
                entityCounter += entityRanges.length;
                
                const absolutePosition = ulMatch.index + liMatch.index;
                
                blockPositions.push({
                    position: absolutePosition,
                    block: {
                        key: generateBlockKey(),
                        data: [],
                        text: text,
                        type: 'unordered-list-item',
                        depth: 0,
                        entityRanges: entityRanges,
                        inlineStyleRanges: inlineStyleRanges
                    }
                });
            }
        }
        
        // Process other block elements
        const blockRegex = /<(p|h1|h2|h3|h4|h5|h6|div|blockquote|pre)[^>]*>([\s\S]*?)<\/\1>/gi;
        let match;
        
        while ((match = blockRegex.exec(htmlContent)) !== null) {
            const [fullMatch, tagName, content] = match;
            const blockType = getBlockTypeFromTag(tagName.toLowerCase());
            
            // Check for text alignment
            const alignmentMatch = fullMatch.match(/style="[^"]*text-align:\s*([^;"\s]+)/i);
            const textAlignment = alignmentMatch ? alignmentMatch[1].toLowerCase() : null;
            
            // Parse inline content
            const { text, inlineStyleRanges, entityRanges } = parseInlineContent(content, entityMap, entityCounter);
            entityCounter += entityRanges.length;

            blockPositions.push({
                position: match.index,
                block: {
                    key: generateBlockKey(),
                    data: textAlignment ? { textAlignment: textAlignment } : [],
                    text: text,
                    type: blockType,
                    depth: 0,
                    entityRanges: entityRanges,
                    inlineStyleRanges: inlineStyleRanges
                }
            });
        }
        
        // Sort blocks by their position in the original HTML
        blockPositions.sort((a, b) => a.position - b.position);
        
        // Extract just the blocks in the correct order
        const orderedBlocks = blockPositions.map(item => item.block);
        
        return {
            blocks: orderedBlocks,
            entityMap: entityMap
        };
    } catch (error) {
        console.error("Error converting HTML to Draft.js:", error);
        
        // Return a basic Draft.js structure as fallback
        return {
            blocks: [
                {
                    key: generateBlockKey(),
                    data: [],
                    text: htmlContent.replace(/<[^>]*>/g, ''),
                    type: 'unstyled',
                    depth: 0,
                    entityRanges: [],
                    inlineStyleRanges: []
                }
            ],
            entityMap: {}
        };
    }
}

/**
 * Parse inline content for styles and entities
 * @private
 */
function parseInlineContent(content, entityMap, entityCounter) {
    let text = '';
    const inlineStyleRanges = [];
    const entityRanges = [];
    let currentEntityCounter = entityCounter;

    try {
        // Ensure content is a string
        if (content === undefined || content === null) {
            return { text: '', inlineStyleRanges: [], entityRanges: [] };
        }
        
        // Convert to string if it's not already
        const contentStr = String(content);
        
        // Extract plain text first
        const cleanText = contentStr.replace(/<[^>]*>/g, '');
        text = cleanText;
        
        // Create a character map to track styles at each position
        const charStyles = Array(cleanText.length).fill().map(() => []);
        const charEntities = Array(cleanText.length).fill(null);
        
        // Helper function to find positions in clean text
        function findPositionsInCleanText(htmlStr, tagName, attributePattern = null) {
            const positions = [];
            const openTagRegex = new RegExp(`<${tagName}(\\s[^>]*)?>(.*?)`, 'g');
            const closeTagRegex = new RegExp(`</${tagName}>`, 'g');
            
            let openMatches = [];
            let match;
            
            // Find all opening tags
            while ((match = openTagRegex.exec(htmlStr)) !== null) {
                // Check attribute pattern if provided
                if (attributePattern && !match[1]?.match(attributePattern)) {
                    continue;
                }
                
                openMatches.push({
                    index: match.index,
                    tagLength: match[0].length
                });
            }
            
            // Find all closing tags
            let closeMatches = [];
            while ((match = closeTagRegex.exec(htmlStr)) !== null) {
                closeMatches.push({
                    index: match.index,
                    tagLength: match[0].length
                });
            }
            
            // Match opening and closing tags
            for (let i = 0; i < openMatches.length; i++) {
                const openMatch = openMatches[i];
                const nextOpenMatch = openMatches[i + 1];
                
                // Find the corresponding closing tag
                let closeMatch = null;
                for (let j = 0; j < closeMatches.length; j++) {
                    if (closeMatches[j].index > openMatch.index) {
                        // If there's a nested tag, make sure we're matching the right closing tag
                        if (!nextOpenMatch || closeMatches[j].index < nextOpenMatch.index) {
                            closeMatch = closeMatches[j];
                            closeMatches.splice(j, 1); // Remove this closing tag from consideration
                            break;
                        }
                    }
                }
                
                if (closeMatch) {
                    // Extract the content between tags
                    const startPos = openMatch.index + openMatch.tagLength;
                    const endPos = closeMatch.index;
                    const tagContent = htmlStr.substring(startPos, endPos);
                    
                    // Remove HTML tags to get plain text
                    const plainContent = tagContent.replace(/<[^>]*>/g, '');
                    
                    // Find this text in the clean text
                    const textPos = cleanText.indexOf(plainContent);
                    if (textPos !== -1) {
                        positions.push({
                            start: textPos,
                            length: plainContent.length,
                            fullTag: htmlStr.substring(openMatch.index, closeMatch.index + closeMatch.tagLength),
                            content: tagContent
                        });
                    }
                }
            }
            
            return positions;
        }
        
        // Process bold tags
        const boldPositions = [
            ...findPositionsInCleanText(contentStr, 'strong'),
            ...findPositionsInCleanText(contentStr, 'b')
        ];
        
        boldPositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('BOLD');
            }
        });
        
        // Process italic tags
        const italicPositions = [
            ...findPositionsInCleanText(contentStr, 'em'),
            ...findPositionsInCleanText(contentStr, 'i')
        ];
        
        italicPositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('ITALIC');
            }
        });
        
        // Process underline tags
        const underlinePositions = findPositionsInCleanText(contentStr, 'u');
        
        underlinePositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('UNDERLINE');
            }
        });
        
        // Process font size tags
        const smallFontPositions = findPositionsInCleanText(contentStr, 'span', /style="[^"]*font-size:\s*small/i);
        smallFontPositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('FONT_SIZE_SMALL');
            }
        });
        
        const normalFontPositions = findPositionsInCleanText(contentStr, 'span', /style="[^"]*font-size:\s*medium/i);
        normalFontPositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('FONT_SIZE_NORMAL');
            }
        });
        
        const largeFontPositions = findPositionsInCleanText(contentStr, 'span', /style="[^"]*font-size:\s*large/i);
        largeFontPositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('FONT_SIZE_LARGE');
            }
        });
        
        const hugeFontPositions = findPositionsInCleanText(contentStr, 'span', /style="[^"]*font-size:\s*x-large/i);
        hugeFontPositions.forEach(pos => {
            for (let i = pos.start; i < pos.start + pos.length; i++) {
                charStyles[i].push('FONT_SIZE_HUGE');
            }
        });
        
        // Process color spans
        const colorPositions = findPositionsInCleanText(contentStr, 'span', /style="[^"]*color:/i);
        
        colorPositions.forEach(pos => {
            const colorMatch = pos.fullTag.match(/style="[^"]*color:\s*([^;"\s]+)/i);
            if (colorMatch) {
                const color = colorMatch[1];
                
                entityMap[currentEntityCounter] = {
                    type: 'CUSTOM',
                    mutability: 'MUTABLE',
                    data: { color }
                };
                
                entityRanges.push({
                    key: currentEntityCounter,
                    offset: pos.start,
                    length: pos.length
                });
                
                currentEntityCounter++;
            }
        });
        
        // Process links
        const linkPositions = findPositionsInCleanText(contentStr, 'a');
        
        linkPositions.forEach(pos => {
            const urlMatch = pos.fullTag.match(/href="([^"]*)"/i);
            if (urlMatch) {
                const url = urlMatch[1];
                
                entityMap[currentEntityCounter] = {
                    type: 'CUSTOM',
                    mutability: 'MUTABLE',
                    data: { url }
                };
                
                entityRanges.push({
                    key: currentEntityCounter,
                    offset: pos.start,
                    length: pos.length
                });
                
                currentEntityCounter++;
            }
        });
        
        // Convert character styles to inline style ranges
        for (let i = 0; i < charStyles.length; i++) {
            const styles = charStyles[i];
            
            styles.forEach(style => {
                // Find an existing range for this style that ends at this position
                const existingRangeIndex = inlineStyleRanges.findIndex(
                    range => range.style === style && range.offset + range.length === i
                );
                
                if (existingRangeIndex !== -1) {
                    // Extend the existing range
                    inlineStyleRanges[existingRangeIndex].length++;
                } else {
                    // Create a new range
                    inlineStyleRanges.push({
                        style,
                        offset: i,
                        length: 1
                    });
                }
            });
        }
        
        // Merge adjacent ranges with the same style
        const mergedRanges = [];
        const rangesByStyle = {};
        
        // Group ranges by style
        inlineStyleRanges.forEach(range => {
            if (!rangesByStyle[range.style]) {
                rangesByStyle[range.style] = [];
            }
            rangesByStyle[range.style].push(range);
        });
        
        // Sort and merge ranges for each style
        Object.keys(rangesByStyle).forEach(style => {
            const ranges = rangesByStyle[style].sort((a, b) => a.offset - b.offset);
            let currentRange = null;
            
            ranges.forEach(range => {
                if (!currentRange) {
                    currentRange = { ...range };
                } else if (currentRange.offset + currentRange.length === range.offset) {
                    // Merge adjacent ranges
                    currentRange.length += range.length;
                } else {
                    // Add the current range and start a new one
                    mergedRanges.push(currentRange);
                    currentRange = { ...range };
                }
            });
            
            if (currentRange) {
                mergedRanges.push(currentRange);
            }
        });
        
        return { 
            text, 
            inlineStyleRanges: mergedRanges, 
            entityRanges 
        };
        
    } catch (error) {
        console.error("Error in parseInlineContent:", error);
        return { text: String(content || ''), inlineStyleRanges: [], entityRanges: [] };
    }
}

/**
 * Get HTML tag for Draft.js style
 * @private
 */
function getStyleTag(style) {
    switch (style) {
        case 'BOLD':
            return 'strong';
        case 'ITALIC':
            return 'em';
        case 'UNDERLINE':
            return 'u';
        case 'FONT_SIZE_SMALL':
        case 'FONT_SIZE_NORMAL':
        case 'FONT_SIZE_LARGE':
        case 'FONT_SIZE_HUGE':
            return 'span';
        default:
            return null;
    }
}

/**
 * Get HTML tag for Draft.js block type
 * @private
 */
function getBlockTag(type) {
    switch (type) {
        case 'header-one':
            return 'h1';
        case 'header-two':
            return 'h2';
        case 'header-three':
            return 'h3';
        case 'unordered-list-item':
            return 'li';
        case 'ordered-list-item':
            return 'li';
        case 'blockquote':
            return 'blockquote';
        case 'code-block':
            return 'pre';
        default:
            return 'p';
    }
}

/**
 * Get Draft.js block type from HTML tag
 * @private
 */
function getBlockTypeFromTag(tagName) {
    switch (tagName) {
        case 'h1':
            return 'header-one';
        case 'h2':
            return 'header-two';
        case 'h3':
            return 'header-three';
        case 'li':
            // This will be overridden if we can determine the list type
            return 'unordered-list-item';
        case 'blockquote':
            return 'blockquote';
        case 'pre':
            return 'code-block';
        default:
            return 'unstyled';
    }
}

/**
 * Generate a random block key for Draft.js blocks
 * @private
 * @returns {string} - A random 5-character key
 */
function generateBlockKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Export the main functions
module.exports = {
    convertRichTextToHtml,
    convertHtmlToDraftJs
};

// Also support ES6 imports
if (typeof module !== 'undefined' && module.exports) {
    module.exports.default = {
        convertRichTextToHtml,
        convertHtmlToDraftJs
    };
}
