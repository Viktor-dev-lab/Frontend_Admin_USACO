import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface Props {
  content: string;
}

const extractText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return '';
};

const slugify = (text: string) => {
  return text.toString().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose max-w-none text-slate-600 dark:text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            throwOnError: false,
            strict: false,
          }]
        ]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative mt-6 mb-8 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
                <div className="flex items-center px-4 py-2 bg-slate-100 dark:bg-[#1e293b] border-b border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  style={(vscDarkPlus as any) || {}}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: '1.25rem', background: '#0f172a', fontSize: '0.9rem' }}
                  {...props}
                >
                  {String(children || '').replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-slate-300 dark:bg-white/10 text-cyan-500 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-slate-100 dark:border-white/5" {...props}>
                {children}
              </code>
            );
          },
          h2: ({ node, children, ...props }) => {
            const id = slugify(extractText(children));
            return <h2 id={id} className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-12 mb-6 border-b border-slate-200 dark:border-white/10 pb-2 scroll-mt-24" {...props}>{children}</h2>;
          },
          h3: ({ node, children, ...props }) => {
            const id = slugify(extractText(children));
            return <h3 id={id} className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-8 mb-4 scroll-mt-24" {...props}>{children}</h3>;
          },
          p: ({ node, ...props }) => (
            <p className="leading-[1.85] mb-5 text-slate-600 dark:text-slate-300 text-[15.5px]" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-cyan-500 hover:text-cyan-400 underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-6 my-4 space-y-1.5 text-slate-600 dark:text-slate-300 text-[15.5px]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-6 my-4 space-y-1.5 text-slate-600 dark:text-slate-300 text-[15.5px]" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-[1.8]" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-6 bg-cyan-500/5 text-slate-600 dark:text-slate-300 not-italic rounded-r-lg" {...props} />
          ),
          img: ({ node, src, alt, ...props }) => (
            <figure className="my-6 text-center">
              <img src={src} alt={alt || ''} className="inline-block max-w-full rounded-lg border border-slate-200 dark:border-white/10" {...props} />
            </figure>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-slate-200 dark:border-white/10 px-4 py-2 bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 font-semibold text-left" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-slate-200 dark:border-white/10 px-4 py-2 text-slate-600 dark:text-slate-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
