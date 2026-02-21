'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
}

interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
  hex?: string;
}

interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  textAlign?: 'right' | 'center' | 'left';
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
}

// Brand palette — only these colors are allowed for text formatting (fail-closed)
const BRAND_COLORS = [
  { hex: '#1a365d', label: 'כחול ראשי' },
  { hex: '#2d4a7c', label: 'כחול בהיר' },
  { hex: '#c9a227', label: 'זהב' },
  { hex: '#e8b923', label: 'זהב בהיר' },
  { hex: '#343a40', label: 'אפור כהה' },
  { hex: '#e74c3c', label: 'אדום' },
  { hex: '#2ecc71', label: 'ירוק' },
  { hex: '#000000', label: 'שחור' },
] as const;

const BRAND_HEX_SET: Set<string> = new Set(BRAND_COLORS.map((c) => c.hex));

/** Normalize any CSS color string (rgb, hex, named) to lowercase 6-digit hex or null. */
function normalizeToHex(color: string): string | null {
  if (!color) return null;
  const s = color.trim().toLowerCase();
  // Already hex
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  // rgb(r, g, b)
  const m = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (m) {
    const hex = (n: string) => parseInt(n, 10).toString(16).padStart(2, '0');
    return `#${hex(m[1]!)}${hex(m[2]!)}${hex(m[3]!)}`;
  }
  return null; // unknown format → strip
}

/** Returns the hex if it's a brand color, otherwise null (fail-closed). */
function sanitizeBrandColor(raw: string): string | null {
  const hex = normalizeToHex(raw);
  return hex && BRAND_HEX_SET.has(hex) ? hex : null;
}

interface RichTextEditorProps {
  label: string;
  value: unknown[] | null | undefined;
  onChange: (value: unknown[]) => void;
  rows?: number;
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Portable Text -> HTML
// ---------------------------------------------------------------------------

function ptBlocksToHtml(blocks: unknown[] | null | undefined): string {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return '';

  const result: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i] as PortableTextBlock;
    if (block._type !== 'block') { i++; continue; }

    // Handle list runs
    if (block.listItem) {
      const listType = block.listItem === 'number' ? 'ol' : 'ul';
      result.push(`<${listType}>`);
      while (i < blocks.length) {
        const lb = blocks[i] as PortableTextBlock;
        if (lb._type !== 'block' || lb.listItem !== block.listItem) break;
        result.push(`<li>${renderSpans(lb)}</li>`);
        i++;
      }
      result.push(`</${listType}>`);
      continue;
    }

    // Normal blocks
    const tag = styleToTag(block.style || 'normal');
    const alignAttr = block.textAlign ? ` style="text-align:${block.textAlign}"` : '';
    result.push(`<${tag}${alignAttr}>${renderSpans(block)}</${tag}>`);
    i++;
  }

  return result.join('');
}

function styleToTag(style: string): string {
  switch (style) {
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'blockquote': return 'blockquote';
    default: return 'p';
  }
}

function renderSpans(block: PortableTextBlock): string {
  const markDefs = block.markDefs || [];
  return (block.children || [])
    .map((span) => {
      let text = escapeHtml(span.text);
      if (!text && !span.marks?.length) return text; // empty span
      const marks = span.marks || [];
      for (const mark of marks) {
        switch (mark) {
          case 'strong':
            text = `<strong>${text}</strong>`;
            break;
          case 'em':
            text = `<em>${text}</em>`;
            break;
          case 'underline':
            text = `<u>${text}</u>`;
            break;
          case 'strike-through':
            text = `<s>${text}</s>`;
            break;
          case 'code':
            text = `<code>${text}</code>`;
            break;
          default: {
            // Could be a markDef reference (e.g. link or color)
            const def = markDefs.find((d) => d._key === mark);
            if (def && def._type === 'link' && def.href) {
              text = `<a href="${escapeHtml(def.href)}">${text}</a>`;
            } else if (def && def._type === 'color' && def.hex) {
              text = `<span style="color:${escapeHtml(def.hex)}">${text}</span>`;
            }
            break;
          }
        }
      }
      return text;
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// HTML -> Portable Text
// ---------------------------------------------------------------------------

function htmlToPtBlocks(html: string): PortableTextBlock[] {
  if (!html || !html.trim()) {
    return [makeBlock('normal', [makeSpan('')])];
  }

  // Use DOMParser to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild as HTMLElement;
  if (!root) return [makeBlock('normal', [makeSpan('')])];

  const blocks: PortableTextBlock[] = [];

  for (let i = 0; i < root.childNodes.length; i++) {
    const node = root.childNodes[i]!;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) {
        blocks.push(makeBlock('normal', [makeSpan(text)]));
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'p': {
        const b = makeBlockFromElement(el, 'normal');
        applyTextAlign(el, b);
        blocks.push(b);
        break;
      }
      case 'h2': {
        const b = makeBlockFromElement(el, 'h2');
        applyTextAlign(el, b);
        blocks.push(b);
        break;
      }
      case 'h3': {
        const b = makeBlockFromElement(el, 'h3');
        applyTextAlign(el, b);
        blocks.push(b);
        break;
      }
      case 'h4': {
        const b = makeBlockFromElement(el, 'h4');
        applyTextAlign(el, b);
        blocks.push(b);
        break;
      }
      case 'blockquote': {
        const b = makeBlockFromElement(el, 'blockquote');
        applyTextAlign(el, b);
        blocks.push(b);
        break;
      }
      case 'ul':
        for (let j = 0; j < el.children.length; j++) {
          const li = el.children[j] as HTMLElement;
          if (li.tagName.toLowerCase() === 'li') {
            const b = makeBlockFromElement(li, 'normal');
            b.listItem = 'bullet';
            b.level = 1;
            blocks.push(b);
          }
        }
        break;
      case 'ol':
        for (let j = 0; j < el.children.length; j++) {
          const li = el.children[j] as HTMLElement;
          if (li.tagName.toLowerCase() === 'li') {
            const b = makeBlockFromElement(li, 'normal');
            b.listItem = 'number';
            b.level = 1;
            blocks.push(b);
          }
        }
        break;
      default:
        // Treat unknown block-level elements as paragraphs
        blocks.push(makeBlockFromElement(el, 'normal'));
        break;
    }
  }

  if (blocks.length === 0) {
    blocks.push(makeBlock('normal', [makeSpan('')]));
  }

  return blocks;
}

function applyTextAlign(el: HTMLElement, block: PortableTextBlock) {
  const align = el.style?.textAlign;
  if (align === 'center' || align === 'left' || align === 'right') {
    block.textAlign = align;
  }
}

function makeBlock(
  style: string,
  children: PortableTextSpan[],
  markDefs?: PortableTextMarkDef[],
  listItem?: 'bullet' | 'number',
  level?: number,
): PortableTextBlock {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    children: children.length > 0 ? children : [makeSpan('')],
    markDefs: markDefs || [],
    ...(listItem ? { listItem, level: level || 1 } : {}),
  };
}

function makeSpan(text: string, marks?: string[]): PortableTextSpan {
  return {
    _type: 'span',
    _key: generateKey(),
    text,
    marks: marks || [],
  };
}

function makeBlockFromElement(el: HTMLElement, style: string): PortableTextBlock {
  const markDefs: PortableTextMarkDef[] = [];
  const spans: PortableTextSpan[] = [];

  walkInlineNodes(el, [], markDefs, spans);

  if (spans.length === 0) {
    spans.push(makeSpan(''));
  }

  return makeBlock(style, spans, markDefs);
}

/**
 * Recursively walk inline nodes inside a block element,
 * collecting spans with their accumulated marks.
 */
function walkInlineNodes(
  node: Node,
  currentMarks: string[],
  markDefs: PortableTextMarkDef[],
  spans: PortableTextSpan[],
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (text) {
      spans.push(makeSpan(text, [...currentMarks]));
    }
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const newMarks = [...currentMarks];

  switch (tag) {
    case 'strong':
    case 'b':
      newMarks.push('strong');
      break;
    case 'em':
    case 'i':
      newMarks.push('em');
      break;
    case 'u':
      newMarks.push('underline');
      break;
    case 's':
    case 'strike':
    case 'del':
      newMarks.push('strike-through');
      break;
    case 'code':
      newMarks.push('code');
      break;
    case 'a': {
      const href = el.getAttribute('href') || '';
      const linkKey = generateKey();
      markDefs.push({ _key: linkKey, _type: 'link', href });
      newMarks.push(linkKey);
      break;
    }
    case 'font': {
      const rawColor = el.getAttribute('color');
      const hex = rawColor ? sanitizeBrandColor(rawColor) : null;
      if (hex) {
        const colorKey = generateKey();
        markDefs.push({ _key: colorKey, _type: 'color', hex });
        newMarks.push(colorKey);
      }
      // Non-brand colors are silently stripped (fail-closed)
      break;
    }
    case 'span': {
      const rawSpanColor = el.style?.color;
      const hex = rawSpanColor ? sanitizeBrandColor(rawSpanColor) : null;
      if (hex) {
        const colorKey = generateKey();
        markDefs.push({ _key: colorKey, _type: 'color', hex });
        newMarks.push(colorKey);
      }
      break;
    }
    case 'br': {
      // Insert a newline character for <br>
      spans.push(makeSpan('\n', [...currentMarks]));
      return;
    }
    default:
      break;
  }

  for (let i = 0; i < el.childNodes.length; i++) {
    walkInlineNodes(el.childNodes[i]!, newMarks, markDefs, spans);
  }
}

// ---------------------------------------------------------------------------
// Toolbar button definitions
// ---------------------------------------------------------------------------

interface ToolbarButton {
  label: string;
  title: string;
  action: (editorEl: HTMLDivElement) => void;
  style?: React.CSSProperties;
}

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function getToolbarButtons(editorEl: HTMLDivElement | null): ToolbarButton[] {
  if (!editorEl) return [];

  return [
    {
      label: 'B',
      title: 'Bold',
      action: () => execCmd('bold'),
      style: { fontWeight: 700 },
    },
    {
      label: 'I',
      title: 'Italic',
      action: () => execCmd('italic'),
      style: { fontStyle: 'italic' },
    },
    {
      label: 'U',
      title: 'Underline',
      action: () => execCmd('underline'),
      style: { textDecoration: 'underline' },
    },
    {
      label: 'S',
      title: 'Strikethrough',
      action: () => execCmd('strikeThrough'),
      style: { textDecoration: 'line-through' },
    },
    {
      label: 'H2',
      title: 'Heading 2',
      action: () => execCmd('formatBlock', 'h2'),
    },
    {
      label: 'H3',
      title: 'Heading 3',
      action: () => execCmd('formatBlock', 'h3'),
    },
    {
      label: 'H4',
      title: 'Heading 4',
      action: () => execCmd('formatBlock', 'h4'),
    },
    {
      label: '\u201C\u201D',
      title: 'Blockquote',
      action: () => execCmd('formatBlock', 'blockquote'),
    },
    {
      label: '\u2022',
      title: 'Bullet List',
      action: () => execCmd('insertUnorderedList'),
    },
    {
      label: '1.',
      title: 'Numbered List',
      action: () => execCmd('insertOrderedList'),
    },
    {
      label: '\uD83D\uDD17',
      title: 'Link',
      action: () => {
        const url = prompt('Enter URL:');
        if (url) {
          execCmd('createLink', url);
        }
      },
    },
    {
      label: '</>',
      title: 'Code',
      action: () => {
        // execCommand doesn't support inline code directly.
        // We wrap the selection in a <code> element manually.
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        if (range.collapsed) return;

        // Check if already inside <code>
        let parent = range.commonAncestorContainer as HTMLElement;
        if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!;
        if (parent && parent.tagName?.toLowerCase() === 'code') {
          // Unwrap: replace <code> with its text content
          const textNode = document.createTextNode(parent.textContent || '');
          parent.parentNode?.replaceChild(textNode, parent);
        } else {
          // Wrap selection in <code>
          const code = document.createElement('code');
          try {
            range.surroundContents(code);
          } catch {
            // If surroundContents fails (partial selection), fall back
            const fragment = range.extractContents();
            code.appendChild(fragment);
            range.insertNode(code);
          }
        }
        selection.removeAllRanges();
        selection.addRange(range);
      },
    },
    {
      label: '\u00B6',
      title: 'Normal Paragraph',
      action: () => execCmd('formatBlock', 'p'),
    },
    // ── Alignment ──
    {
      label: '\u2261\u2192',
      title: 'יישור לימין',
      action: () => execCmd('justifyRight'),
    },
    {
      label: '\u2261',
      title: 'יישור למרכז',
      action: () => execCmd('justifyCenter'),
    },
    {
      label: '\u2190\u2261',
      title: 'יישור לשמאל',
      action: () => execCmd('justifyLeft'),
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RichTextEditor({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [showColors, setShowColors] = useState(false);

  // Calculate min-height from rows (approx 1.5rem line-height + padding)
  const minHeight = `${rows * 1.5}rem`;

  // Initialize editor content from PT value
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;

    const html = ptBlocksToHtml(value);
    // Only update if the content actually changed to avoid cursor jumps
    if (editor.innerHTML !== html) {
      editor.innerHTML = html;
    }
    setIsEmpty(!editor.textContent?.trim());
  }, [value]);

  // Handle input changes: convert current HTML to PT blocks
  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    setIsEmpty(!editor.textContent?.trim());
    isInternalChange.current = true;

    const html = editor.innerHTML;
    const blocks = htmlToPtBlocks(html);
    onChange(blocks);
  }, [onChange]);

  // Handle paste: strip formatting from external sources but keep basic HTML
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      // Sanitize: parse and re-serialize through our converter to strip unwanted tags
      const blocks = htmlToPtBlocks(html);
      const cleanHtml = ptBlocksToHtml(blocks);
      document.execCommand('insertHTML', false, cleanHtml);
    } else if (text) {
      document.execCommand('insertText', false, text);
    }
  }, []);

  // Handle keydown: intercept Enter in certain contexts for better behavior
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Insert 2 spaces for tab
      document.execCommand('insertText', false, '  ');
    }
  }, []);

  const toolbarButtons = getToolbarButtons(editorRef.current);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t border border-gray-300 bg-gray-50 px-1 py-1">
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            title={btn.title}
            onMouseDown={(e) => {
              e.preventDefault();
              btn.action(editorRef.current!);
              setTimeout(() => {
                const editor = editorRef.current;
                if (editor) {
                  setIsEmpty(!editor.textContent?.trim());
                  isInternalChange.current = true;
                  const html = editor.innerHTML;
                  const blocks = htmlToPtBlocks(html);
                  onChange(blocks);
                }
              }, 0);
            }}
            className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300 transition-colors"
            style={btn.style}
          >
            {btn.label}
          </button>
        ))}
        {/* Brand color picker */}
        <div className="relative">
          <button
            type="button"
            title="צבע טקסט"
            onMouseDown={(e) => { e.preventDefault(); setShowColors((v) => !v); }}
            className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300 transition-colors"
          >
            A<span className="block w-3 h-0.5 bg-wdi-primary mt-px" />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 z-10 mt-1 flex gap-1 rounded border border-gray-200 bg-white p-1.5 shadow-md">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd('foreColor', c.hex);
                    setShowColors(false);
                    setTimeout(() => {
                      const editor = editorRef.current;
                      if (editor) {
                        setIsEmpty(!editor.textContent?.trim());
                        isInternalChange.current = true;
                        onChange(htmlToPtBlocks(editor.innerHTML));
                      }
                    }, 0);
                  }}
                  className="h-5 w-5 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor surface */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="w-full rounded-b border border-t-0 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none overflow-y-auto prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:mt-2 [&_h4]:mb-1 [&_blockquote]:border-r-4 [&_blockquote]:border-gray-300 [&_blockquote]:pr-3 [&_blockquote]:text-gray-600 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_a]:text-blue-600 [&_a]:underline"
          style={{ minHeight }}
        />
        {/* Placeholder overlay */}
        {isEmpty && placeholder && (
          <div
            className="pointer-events-none absolute top-2 right-3 text-sm text-gray-400"
            dir="rtl"
          >
            {placeholder}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-400" dir="rtl">
        {'\u05E2\u05D5\u05E8\u05DA \u05D8\u05E7\u05E1\u05D8 \u05E2\u05E9\u05D9\u05E8 \u2014 \u05D4\u05E9\u05EA\u05DE\u05E9 \u05D1\u05E1\u05E8\u05D2\u05DC \u05D4\u05DB\u05DC\u05D9\u05DD \u05DC\u05E2\u05D9\u05E6\u05D5\u05D1'}
      </p>
    </div>
  );
}
