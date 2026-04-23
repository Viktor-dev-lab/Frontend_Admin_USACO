import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, PlayCircle, Lock, FileText, Image as ImageIcon } from 'lucide-react';
import type { ContentBlock } from '../../types/curriculum';
import 'katex/dist/katex.min.css';

interface LessonPreviewProps {
  blocks: ContentBlock[];
}

const LessonPreview: React.FC<LessonPreviewProps> = ({ blocks }) => {
  return (
    <div className="preview-container">
      <style>{`
        .preview-container {
          background-color: #0d1117;
          color: #cbd5e1;
          padding: 0;
          font-family: 'Inter', -apple-system, sans-serif;
          line-height: 1.8;
          font-size: 17px;
          min-height: 100%;
          overflow-y: auto;
        }
        .preview-block:first-child .preview-h2,
        .preview-block:first-child .preview-h3 {
          margin-top: 0 !important;
        }
        .preview-h2 {
          font-size: 1.875rem;
          font-weight: 800;
          color: #f8fafc;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        .preview-h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .preview-paragraph {
          margin-bottom: 1.25rem;
        }
        .preview-paragraph code {
          background-color: #1e293b;
          color: #38bdf8;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
        }
        .preview-image-container {
          margin: 2.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0a0c10;
        }
        .preview-image-caption {
          padding: 0.75rem 1rem;
          text-align: center;
          font-size: 0.875rem;
          color: #94a3b8;
          background: #161b22;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .preview-callout {
          border-left: 4px solid #3b82f6;
          background-color: rgba(59, 130, 246, 0.05);
          padding: 1.5rem;
          border-radius: 0 0.75rem 0.75rem 0;
          margin: 1.5rem 0;
        }
        .preview-premium-box {
          background: #161b22;
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .preview-premium-badge {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
      `}</style>
      
      {blocks.map((block) => (
        <div key={block.id} className="preview-block">
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
};

const renderBlock = (block: ContentBlock) => {
  switch (block.type) {
    case 'heading':
      const Tag = block.props?.level === 1 ? 'h1' : block.props?.level === 3 ? 'h3' : 'h2';
      return <Tag className={Tag === 'h3' ? 'preview-h3' : 'preview-h2'}>{block.content}</Tag>;
    
    case 'paragraph':
      if (block.props?.isPremium) {
        return (
          <div className="preview-premium-box">
            <Lock size={18} color="#f59e0b" />
            <div>
              <div className="preview-premium-badge">PREMIUM CONTENT</div>
              <div style={{ marginTop: 4 }}>{block.content}</div>
            </div>
          </div>
        );
      }
      return (
        <div className="preview-paragraph">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {block.content}
          </ReactMarkdown>
        </div>
      );
    
    case 'codeBlock':
      return (
        <div style={{ margin: '2rem 0', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: '#161b22', padding: '8px 16px', fontSize: '0.75rem', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{block.props?.language?.toUpperCase() || 'CODE'}</span>
            <Copy size={14} />
          </div>
          <SyntaxHighlighter 
            language={block.props?.language || 'python'} 
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1.5rem', background: '#0d1117' }}
          >
            {block.content}
          </SyntaxHighlighter>
        </div>
      );

    case 'multi_code_block':
      return <MultiCodePreview block={block} />;
    
    case 'image':
      return (
        <div className="preview-image-container">
          <img 
            src={block.props?.url || 'https://via.placeholder.com/800x400?text=Image+URL+Not+Found'} 
            alt={block.props?.caption} 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
          {block.props?.caption && <div className="preview-image-caption">{block.props.caption}</div>}
        </div>
      );
      
    case 'video':
      const url = block.props?.url || '';
      const videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
      return (
        <div className="preview-image-container" style={{ background: '#000' }}>
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allowFullScreen 
            />
          </div>
          {block.props?.caption && <div className="preview-image-caption">{block.props.caption}</div>}
        </div>
      );

    case 'file':
      return (
        <div style={{ background: '#161b22', borderRadius: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)', margin: '1.5rem 0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            <FileText size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{block.content}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{block.props?.fileType?.toUpperCase()} • {block.props?.fileSize}</div>
          </div>
          <button style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Download</button>
        </div>
      );

    default:
      return null;
  }
};

const MultiCodePreview: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const [activeLang, setActiveLang] = useState<'cpp' | 'java' | 'python'>('cpp');
  const currentCode = activeLang === 'cpp' ? block.props?.cppCode : activeLang === 'java' ? block.props?.javaCode : block.props?.pythonCode;

  return (
    <div style={{ margin: '2rem 0', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0d1117' }}>
      <div style={{ background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <div style={{ display: 'flex' }}>
          {['cpp', 'java', 'python'].map(lang => (
            <button 
              key={lang}
              onClick={() => setActiveLang(lang as any)}
              style={{
                padding: '12px 16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: activeLang === lang ? '#3b82f6' : '#94a3b8',
                borderBottom: `2px solid ${activeLang === lang ? '#3b82f6' : 'transparent'}`,
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ color: '#94a3b8', paddingRight: 8 }}><Copy size={14} /></div>
      </div>
      <SyntaxHighlighter 
        language={activeLang} 
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1.5rem', background: '#0d1117', maxHeight: '400px' }}
      >
        {currentCode || ''}
      </SyntaxHighlighter>
    </div>
  );
};

export default LessonPreview;
