'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Minimal Portable Text block structure.
 * Each paragraph becomes a block with children spans.
 */
interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style?: string;
  children: { _type: 'span'; _key: string; text: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
}

interface RichTextEditorProps {
  label: string;
  value: unknown[] | null | undefined;
  onChange: (value: unknown[]) => void;
  rows?: number;
  placeholder?: string;
}

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Convert Portable Text blocks array to plain text for editing */
function blocksToText(blocks: unknown[] | null | undefined): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map((b) => {
      const block = b as PortableTextBlock;
      if (block._type !== 'block') return '';
      return (block.children || []).map((child) => child.text || '').join('');
    })
    .join('\n');
}

/** Convert plain text to Portable Text blocks array */
function textToBlocks(text: string): PortableTextBlock[] {
  const lines = text.split('\n');
  return lines.map((line) => ({
    _type: 'block' as const,
    _key: generateKey(),
    style: 'normal',
    children: [{ _type: 'span' as const, _key: generateKey(), text: line }],
    markDefs: [],
  }));
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
}: RichTextEditorProps) {
  const [text, setText] = useState(() => blocksToText(value));

  // Sync from external value changes (e.g. when loading from API)
  useEffect(() => {
    const newText = blocksToText(value);
    setText(newText);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      onChange(textToBlocks(newText));
    },
    [onChange],
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={text}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        dir="rtl"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
      />
      <p className="mt-1 text-xs text-gray-400">כל שורה הופכת לפסקה נפרדת</p>
    </div>
  );
}
