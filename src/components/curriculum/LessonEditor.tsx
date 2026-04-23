import React, { useState } from 'react';
import styles from '../../pages/Curriculum.module.css';
import { 
  ArrowLeft, Save, Plus, GripVertical, Copy, Trash2, Type, Code, 
  Image as ImageIcon, MessageSquare, Lock, Video, FileArchive, 
  Heading1, Heading2, AlignLeft, Layout, Columns, Eye, Square, Loader2
} from 'lucide-react';
import type { Lesson, ContentBlock, ContentBlockType } from '../../types/curriculum';
import LessonPreview from './LessonPreview';

interface LessonEditorProps {
  lesson: Lesson;
  onBack: () => void;
  onSave: (updatedLesson: Lesson) => Promise<boolean>;
}

const LessonEditor: React.FC<LessonEditorProps> = ({ lesson, onBack, onSave }) => {
  const [formData, setFormData] = useState<Lesson>(lesson);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    lesson.content_json || [{ id: 'blk_1', type: 'paragraph', content: '', props: {} }]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleFieldChange = (field: keyof Lesson, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'title' && typeof value === 'string') {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return newData;
    });
  };

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: `blk_${Date.now()}`,
      type,
      content: '',
      props: type === 'heading' ? { level: 2 } : {}
    };
    setBlocks(prev => [...prev, newBlock]);
    setIsMenuOpen(false);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const updateBlockProps = (id: string, props: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b));
  };

  const duplicateBlock = (block: ContentBlock) => {
    const idx = blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, { ...block, id: `blk_${Date.now()}` });
    setBlocks(newBlocks);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return;
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await onSave({ ...formData, content_json: blocks });
    setIsSaving(false);
    if (ok) {
      showToast('success', 'Lesson saved successfully!');
    } else {
      showToast('error', 'Failed to save. Please try again.');
    }
  };

  return (
    <>
      {/* Sticky Action Bar */}
      <div className={styles.stickyBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className={styles.btnSecondary} onClick={onBack} style={{ border: 'none', padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--frappe-text-main)' }}>{formData.title}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--frappe-text-muted)' }}>Editing Lesson</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--frappe-input-bg)', padding: 4, borderRadius: 8, border: '1px solid var(--frappe-border)' }}>
          <button 
            className={`${styles.iconBtn} ${layoutMode === 'edit' ? styles.btnPrimary : ''}`} 
            onClick={() => setLayoutMode('edit')}
            title="Edit Mode"
            style={{ color: layoutMode === 'edit' ? 'white' : 'inherit' }}
          >
            <Square size={16} />
          </button>
          <button 
            className={`${styles.iconBtn} ${layoutMode === 'split' ? styles.btnPrimary : ''}`} 
            onClick={() => setLayoutMode('split')}
            title="Split Mode"
            style={{ color: layoutMode === 'split' ? 'white' : 'inherit' }}
          >
            <Columns size={16} />
          </button>
          <button 
            className={`${styles.iconBtn} ${layoutMode === 'preview' ? styles.btnPrimary : ''}`} 
            onClick={() => setLayoutMode('preview')}
            title="Preview Mode"
            style={{ color: layoutMode === 'preview' ? 'white' : 'inherit' }}
          >
            <Eye size={16} />
          </button>
        </div>

        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={handleSave}
          disabled={isSaving}
          style={{ opacity: isSaving ? 0.75 : 1, minWidth: 130 }}
        >
          {isSaving ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
          ) : (
            <><Save size={16} /> Save Lesson</>
          )}
        </button>
      </div>

      <div className={styles.editorContainer} style={{ 
        display: 'grid', 
        gridTemplateColumns: layoutMode === 'split' ? '1fr 1fr' : '1fr',
        height: 'calc(100vh - 140px)', 
        overflow: 'hidden',
        gap: 0 // Remove gap for perfect split
      }}>
        {/* LEFT SIDE: EDITOR */}
        {(layoutMode === 'edit' || layoutMode === 'split') && (
          <div 
            className={styles.editorPane} 
            style={{ 
              overflowY: 'auto', 
              padding: '8px 40px 40px 40px', // Adjusted top padding to align card with preview heading
              borderRight: layoutMode === 'split' ? '1px solid var(--frappe-border)' : 'none',
              background: 'var(--frappe-bg)'
            }}
          >
            <div style={{ maxWidth: layoutMode === 'split' ? '100%' : '800px', margin: '0 auto' }}>
              {/* Section 1: Lesson Details Metadata */}
              <div className={styles.frappeCard}>
                <h3 className={styles.cardSectionTitle}>Lesson Details</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.formLabel}>Lesson Title</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      style={{ fontSize: '1.2rem', fontWeight: 600 }}
                      value={formData.title} 
                      onChange={e => handleFieldChange('title', e.target.value)} 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>URL Slug</label>
                    <input type="text" className={styles.formInput} value={formData.slug} onChange={e => handleFieldChange('slug', e.target.value)} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Frequency</label>
                    <select className={styles.formSelect} value={formData.frequency || ''} onChange={e => handleFieldChange('frequency', e.target.value)}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Frequency Level (1-5)</label>
                    <input type="number" min="1" max="5" className={styles.formInput} value={formData.frequency_level || 1} onChange={e => handleFieldChange('frequency_level', parseInt(e.target.value))} />
                  </div>

                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: 'var(--frappe-text-main)', marginBottom: 2 }}>
                        <Lock size={14} color="#8b5cf6" /> Premium Required
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--frappe-text-muted)' }}>Require paid subscription to view</div>
                    </div>
                    <div className={`${styles.toggleSwitch} ${formData.has_premium_blocks ? styles.active : ''}`} onClick={() => handleFieldChange('has_premium_blocks', !formData.has_premium_blocks)}>
                      <div className={styles.toggleKnob}></div>
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.formLabel}>Short Description</label>
                    <textarea className={styles.formTextarea} value={formData.short_desc || ''} onChange={e => handleFieldChange('short_desc', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24, marginTop: 40 }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--frappe-text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Lesson Content Editor 
                </h3>
                <p style={{ color: 'var(--frappe-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Build your lesson by stacking content blocks below.
                </p>
              </div>

              <div className={styles.blockEditor}>
                {blocks.map((block) => (
                  <div key={block.id} className={styles.contentBlock}>
                    <div className={styles.blockLabel}>{block.type}</div>
                    
                    <div className={styles.blockToolbar}>
                      <button className={styles.iconBtn} title="Duplicate" onClick={() => duplicateBlock(block)}><Copy size={16} /></button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} title="Delete Block" onClick={() => deleteBlock(block.id)}><Trash2 size={16} /></button>
                    </div>

                    <div className={styles.blockContent}>
                      {block.type === 'heading' && (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <select 
                            className={styles.formSelect} 
                            style={{ width: 80 }}
                            value={block.props?.level || 2}
                            onChange={e => updateBlockProps(block.id, { level: parseInt(e.target.value) })}
                          >
                            <option value={1}>H1</option>
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                          </select>
                          <input 
                            type="text"
                            className={styles.formInput}
                            placeholder="Enter heading text..."
                            value={block.content}
                            onChange={e => updateBlockContent(block.id, e.target.value)}
                          />
                        </div>
                      )}

                      {block.type === 'paragraph' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <textarea 
                            className={styles.blockTextarea} 
                            placeholder="Type paragraph content..."
                            value={block.content}
                            onChange={e => updateBlockContent(block.id, e.target.value)}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--frappe-text-muted)' }}>
                            <input 
                              type="checkbox" 
                              checked={!!block.props?.isPremium}
                              onChange={e => updateBlockProps(block.id, { isPremium: e.target.checked })}
                            />
                            Mark as Premium Tip/Note
                          </label>
                        </div>
                      )}
                      
                      {block.type === 'codeBlock' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <select 
                            className={styles.formSelect} 
                            style={{ width: 120 }}
                            value={block.props?.language || 'python'}
                            onChange={e => updateBlockProps(block.id, { language: e.target.value })}
                          >
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                          </select>
                          <textarea 
                            className={styles.blockCode} 
                            placeholder="Paste code here..."
                            value={block.content}
                            onChange={e => updateBlockContent(block.id, e.target.value)}
                            spellCheck={false}
                          />
                        </div>
                      )}

                      {block.type === 'multi_code_block' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>C++ Code</label>
                            <textarea className={styles.blockCode} value={block.props?.cppCode || ''} onChange={e => updateBlockProps(block.id, { cppCode: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Java Code</label>
                            <textarea className={styles.blockCode} value={block.props?.javaCode || ''} onChange={e => updateBlockProps(block.id, { javaCode: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Python Code</label>
                            <textarea className={styles.blockCode} value={block.props?.pythonCode || ''} onChange={e => updateBlockProps(block.id, { pythonCode: e.target.value })} />
                          </div>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.formLabel}>Image URL</label>
                            <input type="text" className={styles.formInput} value={block.props?.url || ''} onChange={e => updateBlockProps(block.id, { url: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Caption</label>
                            <input type="text" className={styles.formInput} value={block.props?.caption || ''} onChange={e => updateBlockProps(block.id, { caption: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Width (px)</label>
                            <input type="number" className={styles.formInput} value={block.props?.width || 600} onChange={e => updateBlockProps(block.id, { width: parseInt(e.target.value) })} />
                          </div>
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.formLabel}>Video URL (YouTube/Vimeo)</label>
                            <input type="text" className={styles.formInput} value={block.props?.url || ''} onChange={e => updateBlockProps(block.id, { url: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Caption</label>
                            <input type="text" className={styles.formInput} value={block.props?.caption || ''} onChange={e => updateBlockProps(block.id, { caption: e.target.value })} />
                          </div>
                        </div>
                      )}

                      {block.type === 'file' && (
                        <div className={styles.formGrid}>
                          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.formLabel}>File Name / Display Text</label>
                            <input type="text" className={styles.formInput} value={block.content} onChange={e => updateBlockContent(block.id, e.target.value)} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Download URL</label>
                            <input type="text" className={styles.formInput} value={block.props?.url || ''} onChange={e => updateBlockProps(block.id, { url: e.target.value })} />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>File Type (pdf/word/etc)</label>
                            <input type="text" className={styles.formInput} value={block.props?.fileType || ''} onChange={e => updateBlockProps(block.id, { fileType: e.target.value })} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{ position: 'relative', marginTop: 16 }}>
                  <button className={styles.addBlockButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Plus size={18} /> Add Block
                  </button>
                  
                  {isMenuOpen && (
                    <div className={styles.addBlockMenu}>
                      <button className={styles.addBlockItem} onClick={() => addBlock('heading')}>
                        <Heading2 size={16} color="#3b82f6" /> Heading
                      </button>
                      <button className={styles.addBlockItem} onClick={() => addBlock('paragraph')}>
                        <AlignLeft size={16} color="#10b981" /> Paragraph
                      </button>
                      <button className={styles.addBlockItem} onClick={() => addBlock('codeBlock')}>
                        <Code size={16} color="#f59e0b" /> Code Block
                      </button>
                      <button className={styles.addBlockItem} onClick={() => addBlock('multi_code_block')}>
                        <Layout size={16} color="#ec4899" /> Multi-Language Code
                      </button>
                      <button className={styles.addBlockItem} onClick={() => addBlock('image')}>
                        <ImageIcon size={16} color="#a855f7" /> Image
                      </button>
                      <button className={styles.addBlockItem} onClick={() => addBlock('video')}>
                        <Video size={16} color="#ef4444" /> Video
                      </button>
                      <button className={styles.addBlockItem} onClick={() => addBlock('file')}>
                        <FileArchive size={16} color="#6366f1" /> File Attachment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT SIDE: PREVIEW */}
        {(layoutMode === 'preview' || layoutMode === 'split') && (
          <div 
            className={styles.previewPane} 
            style={{ 
              overflowY: 'auto', 
              background: '#0d1117',
              padding: '32px'
            }}
          >
            <div style={{ 
              maxWidth: layoutMode === 'preview' ? '900px' : '100%', 
              margin: '0 auto'
            }}>
              <LessonPreview blocks={blocks} />
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 9999,
          padding: '14px 20px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'slideInRight 0.25s ease',
          background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          backdropFilter: 'blur(12px)',
        }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default LessonEditor;
