/**
 * Portable Text renderer for rich content fields — DOC-060 §6.1
 * Renders Sanity block content with semantic HTML.
 */
import { PortableText as PortableTextRenderer, type PortableTextComponents } from '@portabletext/react';

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="text-2xl font-bold text-[#1a1a2e] mt-8 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold text-[#1a1a2e] mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-semibold text-[#212529] mt-4 mb-2">{children}</h4>,
    normal: ({ children }) => <p className="text-[#343a40] leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-r-4 border-wdi-secondary pr-4 my-6 text-[#495057] italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-[#343a40] mr-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-[#343a40] mr-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[#1a1a2e]">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href ?? '#';
      const isExternal = href.startsWith('http');
      return (
        <a
          href={href}
          className="text-wdi-primary underline hover:text-wdi-primary-light transition"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function PortableText({ value }: { value: any }) {
  if (!value) return null;
  return <PortableTextRenderer value={value} components={components} />;
}
