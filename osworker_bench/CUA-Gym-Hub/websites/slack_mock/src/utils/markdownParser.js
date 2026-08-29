
import React from 'react';

// Parse markdown syntax and return React elements
export const parseMarkdown = (text) => {
  if (!text || typeof text !== 'string') return text;

  const elements = [];
  let currentIndex = 0;
  let key = 0;

  // Regular expressions for markdown patterns
  const patterns = [
    // Links: [text](url)
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
    // Inline code: `code`
    { regex: /`([^`]+)`/g, type: 'code' },
    // Bold: **text**
    { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
    // Italic: *text* or _text_
    { regex: /(?:\*|_)([^*_]+)(?:\*|_)/g, type: 'italic' },
    // Strikethrough: ~text~
    { regex: /~([^~]+)~/g, type: 'strikethrough' }
  ];

  // Find all markdown matches with their positions
  const matches = [];
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type: pattern.type,
        start: match.index,
        end: match.index + match[0].length,
        fullMatch: match[0],
        content: match[1],
        url: match[2] || null
      });
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep the first one)
  const filteredMatches = [];
  let lastEnd = -1;
  matches.forEach(match => {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  });

  // Build elements array
  filteredMatches.forEach(match => {
    // Add text before this match
    if (currentIndex < match.start) {
      const plainText = text.substring(currentIndex, match.start);
      elements.push(<span key={key++}>{plainText}</span>);
    }

    // Add the formatted element
    switch (match.type) {
      case 'bold':
        elements.push(<strong key={key++}>{match.content}</strong>);
        break;
      case 'italic':
        elements.push(<em key={key++}>{match.content}</em>);
        break;
      case 'strikethrough':
        elements.push(<del key={key++}>{match.content}</del>);
        break;
      case 'code':
        elements.push(
          <code key={key++} style={{
            backgroundColor: '#f0f0f0',
            padding: '2px 4px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
            color: '#e01e5a'
          }}>
            {match.content}
          </code>
        );
        break;
      case 'link':
        elements.push(
          <a
            key={key++}
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1264a3',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            {match.content}
          </a>
        );
        break;
      default:
        elements.push(<span key={key++}>{match.fullMatch}</span>);
    }

    currentIndex = match.end;
  });

  // Add remaining text after last match
  if (currentIndex < text.length) {
    const plainText = text.substring(currentIndex);
    elements.push(<span key={key++}>{plainText}</span>);
  }

  return elements.length > 0 ? elements : text;
};

// Helper function to insert markdown syntax at cursor position
export const insertMarkdownSyntax = (textarea, syntax, wrapSelection = true) => {
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  let newText;
  let newCursorPos;

  switch (syntax) {
    case 'bold':
      if (wrapSelection && selectedText) {
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        newCursorPos = end + 4;
      } else {
        newText = text.substring(0, start) + '****' + text.substring(end);
        newCursorPos = start + 2;
      }
      break;

    case 'italic':
      if (wrapSelection && selectedText) {
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        newCursorPos = end + 2;
      } else {
        newText = text.substring(0, start) + '**' + text.substring(end);
        newCursorPos = start + 1;
      }
      break;

    case 'strikethrough':
      if (wrapSelection && selectedText) {
        newText = text.substring(0, start) + `~${selectedText}~` + text.substring(end);
        newCursorPos = end + 2;
      } else {
        newText = text.substring(0, start) + '~~' + text.substring(end);
        newCursorPos = start + 1;
      }
      break;

    case 'code':
      if (wrapSelection && selectedText) {
        newText = text.substring(0, start) + `\`${selectedText}\`` + text.substring(end);
        newCursorPos = end + 2;
      } else {
        newText = text.substring(0, start) + '``' + text.substring(end);
        newCursorPos = start + 1;
      }
      break;

    case 'link':
      if (wrapSelection && selectedText) {
        newText = text.substring(0, start) + `[${selectedText}](url)` + text.substring(end);
        newCursorPos = start + selectedText.length + 3;
      } else {
        newText = text.substring(0, start) + '[link text](url)' + text.substring(end);
        newCursorPos = start + 1;
      }
      break;

    case 'orderedList': {
      // Insert numbered list item(s): if selection spans multiple lines, prefix each with "1. "
      if (wrapSelection && selectedText) {
        const lines = selectedText.split('\n');
        const numbered = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        newText = text.substring(0, start) + numbered + text.substring(end);
        newCursorPos = start + numbered.length;
      } else {
        // Insert "1. " at beginning of current line
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const linePrefix = text.substring(lineStart, start);
        if (linePrefix.match(/^\d+\. /)) {
          // Already has numbered prefix, do nothing extra
          newText = text.substring(0, start) + '1. ' + text.substring(start);
          newCursorPos = start + 3;
        } else {
          newText = text.substring(0, lineStart) + '1. ' + text.substring(lineStart);
          newCursorPos = start + 3;
        }
      }
      break;
    }

    case 'bulletList': {
      // Insert bullet list item(s): prefix selected lines or current line with "• "
      if (wrapSelection && selectedText) {
        const lines = selectedText.split('\n');
        const bulleted = lines.map(line => `• ${line}`).join('\n');
        newText = text.substring(0, start) + bulleted + text.substring(end);
        newCursorPos = start + bulleted.length;
      } else {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        newText = text.substring(0, lineStart) + '• ' + text.substring(lineStart);
        newCursorPos = start + 2;
      }
      break;
    }

    case 'blockquote': {
      // Prefix selected lines or current line with "> "
      if (wrapSelection && selectedText) {
        const lines = selectedText.split('\n');
        const quoted = lines.map(line => `> ${line}`).join('\n');
        newText = text.substring(0, start) + quoted + text.substring(end);
        newCursorPos = start + quoted.length;
      } else {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        newText = text.substring(0, lineStart) + '> ' + text.substring(lineStart);
        newCursorPos = start + 2;
      }
      break;
    }

    case 'codeBlock': {
      // Wrap selection or insert code block markers ```
      if (wrapSelection && selectedText) {
        newText = text.substring(0, start) + '```\n' + selectedText + '\n```' + text.substring(end);
        newCursorPos = start + selectedText.length + 8;
      } else {
        newText = text.substring(0, start) + '```\n\n```' + text.substring(end);
        newCursorPos = start + 4;
      }
      break;
    }

    default:
      return;
  }

  textarea.value = newText;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();

  // Trigger change event
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

// Helper to extract plain text from markdown (for previews)
export const stripMarkdown = (text) => {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/_([^_]+)_/g, '$1') // Italic
    .replace(/~([^~]+)~/g, '$1'); // Strikethrough
};
