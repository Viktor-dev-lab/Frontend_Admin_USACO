import React, { useState, useMemo, useCallback } from 'react';
import { FileText, Plus, X, Pencil, Eye, Database } from 'lucide-react';
import { useStudio } from './StudioContext';
import MarkdownRenderer from '../MarkdownRenderer';
import styles from '../../pages/ProblemStudio.module.css';
import type { TestcaseExtended } from '../../types/studio';

// Note: Using a local simple modal for brevity, or we could import the one from TestcaseStudio
// For now, let's just use the table and link to the Testcase tab if needed, 
// OR implement a quick inline edit modal.

const StatementEditor: React.FC = () => {
  const { state, dispatch } = useStudio();
  const [lang, setLang] = useState<'en' | 'vi'>('en');
  const [editingTc, setEditingTc] = useState<TestcaseExtended | null>(null);

  const content = lang === 'en' ? state.statementEN : state.statementVI;

  const handleContentChange = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_STATEMENT', payload: { lang, content: { [field]: value } } });
  }, [dispatch, lang]);

  // Examples are now pulled from the global testcases state
  const examples = useMemo(() => 
    state.testcases.filter(tc => tc.isExample).sort((a, b) => a.index - b.index),
    [state.testcases]
  );

  const addExample = () => {
    const tc: TestcaseExtended = {
      id: Math.random().toString(36).substring(2, 9),
      index: state.testcases.length,
      type: 'manual',
      input: '',
      output: '',
      inputSize: 0,
      outputSize: 0,
      isHidden: false,
      isExample: true, // Mark as example immediately
      points: 0,
      group: 'samples',
      validationStatus: 'pending',
    };
    dispatch({ type: 'ADD_TESTCASES', payload: [tc] });
    setEditingTc(tc);
  };

  const removeExample = (id: string) => {
    // We just turn off the 'isExample' flag instead of deleting, 
    // unless it's an empty manual test
    dispatch({ 
      type: 'UPDATE_TESTCASE', 
      payload: { id, updates: { isExample: false } } 
    });
  };

  const previewMd = useMemo(() => {
    let md = '';
    if (content.description) md += content.description + '\n\n';
    if (content.input_format) md += '## Input\n\n' + content.input_format + '\n\n';
    if (content.output_format) md += '## Output\n\n' + content.output_format + '\n\n';
    if (content.note) md += '## Note\n\n' + content.note + '\n\n';
    return md || '*Start writing the problem statement...*';
  }, [content]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getSnippet = (text: string) => {
    if (!text) return '(empty)';
    const firstLine = text.split('\n')[0];
    return firstLine.slice(0, 30) + (text.length > 30 || text.includes('\n') ? '...' : '');
  };

  return (
    <div className={styles.fadeIn}>
      <div className={styles.sectionTitle}>
        <div className="icon"><FileText size={20} /></div>
        <h2>Problem Statement</h2>
      </div>
      <p className={styles.sectionDescription}>
        Write the problem description in Markdown. Sample tests are pulled from the global Testcase Studio.
      </p>

      {/* Split Pane */}
      <div className={styles.splitPane}>
        {/* ── Left: Editor ── */}
        <div className={styles.splitLeft}>
          <div className={styles.splitHeader}>
            <div className={styles.langTabs}>
              <button
                className={`${styles.langTab} ${lang === 'en' ? styles.langTabActive : ''}`}
                onClick={() => setLang('en')}
              >
                🇺🇸 English
              </button>
              <button
                className={`${styles.langTab} ${lang === 'vi' ? styles.langTabActive : ''}`}
                onClick={() => setLang('vi')}
              >
                🇻🇳 Tiếng Việt
              </button>
            </div>
          </div>

          <div className={styles.splitContent} style={{ padding: 16 }}>
            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.label}>Problem Description</label>
              <textarea
                value={content.description}
                onChange={(e) => handleContentChange('description', e.target.value)}
                className={styles.textarea}
                style={{ minHeight: 180 }}
                placeholder="Given an array $a$..."
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.label}>Input Format</label>
              <textarea
                value={content.input_format}
                onChange={(e) => handleContentChange('input_format', e.target.value)}
                className={styles.textarea}
                style={{ minHeight: 80 }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.label}>Output Format</label>
              <textarea
                value={content.output_format}
                onChange={(e) => handleContentChange('output_format', e.target.value)}
                className={styles.textarea}
                style={{ minHeight: 80 }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.label}>Notes / Hints</label>
              <textarea
                value={content.note}
                onChange={(e) => handleContentChange('note', e.target.value)}
                className={styles.textarea}
                style={{ minHeight: 80 }}
              />
            </div>

            {/* Redesigned Example Table */}
            <div style={{
              padding: 20, background: 'var(--s-bg-2)', borderRadius: 'var(--s-radius-lg)',
              border: '1px solid var(--s-border)', width: '100%', boxSizing: 'border-box'
            }}>
              <div className={styles.cardHeader} style={{ marginBottom: 16 }}>
                <h3 style={{ color: 'var(--s-text-h)', margin: 0, fontSize: '0.9rem' }}>Sample Testcases</h3>
                <button onClick={addExample} className={styles.btnOutline} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                  <Plus size={13} /> Add Sample
                </button>
              </div>

              {examples.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1px solid var(--s-border)', borderRadius: '8px' }}>
                  <table className={styles.premiumTable}>
                    <thead>
                      <tr>
                        <th style={{ width: 40, textAlign: 'center' }}>#</th>
                        <th>Input Snippet</th>
                        <th>Size</th>
                        <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examples.map((ex, idx) => (
                        <tr key={ex.id}>
                          <td style={{ fontWeight: 600, color: 'var(--s-text-h)', textAlign: 'center' }}>{idx + 1}</td>
                          <td><span className={styles.snippetCard}>{getSnippet(ex.input)}</span></td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--s-text-dim)' }}>{formatBytes(ex.inputSize + ex.outputSize)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                              <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'testcases' })} className={styles.actionBtnGhost} title="Edit in Studio">
                                <Database size={14} />
                              </button>
                              <button onClick={() => removeExample(ex.id)} className={styles.actionBtnGhost} style={{ color: '#ef4444' }} title="Remove from Statement">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--s-text-dim)', fontSize: '0.85rem' }}>
                  No sample testcases selected.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className={styles.splitDivider} />

        {/* ── Right: Preview ── */}
        <div className={styles.splitRight}>
          <div className={styles.splitHeader}>
            <span style={{ fontWeight: 600, color: 'var(--s-text-h)', fontSize: '0.88rem' }}>Live Preview</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, background: 'var(--s-accent-dim)', color: 'var(--s-accent)' }}>
                {state.meta.time_limit}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, background: 'var(--s-purple-dim)', color: 'var(--s-purple)' }}>
                {state.meta.memory_limit}
              </span>
            </div>
          </div>

          <div className={styles.splitContent} style={{ padding: '24px 28px' }}>
            <MarkdownRenderer content={previewMd} />

            {/* Rendered Examples in Preview */}
            {examples.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ color: 'var(--s-text-h)', fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
                  Examples
                </h3>
                {examples.map((ex, idx) => (
                  <div key={ex.id} style={{
                    marginBottom: 14, border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)',
                    overflow: 'hidden', width: '100%', boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--s-border)' }}>
                      <div style={{ flex: 1, padding: '5px 12px', background: 'var(--s-bg-3)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--s-text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', borderRight: '1px solid var(--s-border)' }}>Input</div>
                      <div style={{ flex: 1, padding: '5px 12px', background: 'var(--s-bg-3)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--s-text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Output</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <pre className={styles.monoPreview} style={{ flex: 1, minWidth: 0, padding: '10px 12px', background: 'var(--s-bg-2)', margin: 0, borderRight: '1px solid var(--s-border)', overflowX: 'auto' }}>
                        {ex.input || '(empty)'}
                      </pre>
                      <pre className={styles.monoPreview} style={{ flex: 1, minWidth: 0, padding: '10px 12px', background: 'var(--s-bg-2)', margin: 0, overflowX: 'auto' }}>
                        {ex.output || '(empty)'}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementEditor;
