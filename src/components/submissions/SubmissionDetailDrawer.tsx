import React, { useEffect } from 'react';
import styles from '../../pages/Submissions.module.css';
import { X, ShieldAlert, ShieldCheck, Copy, Play, UserCircle2, Bot, TerminalSquare } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { Submission } from '../../types/submission';

interface DrawerProps {
  submission: Submission | null;
  onClose: () => void;
}

const SubmissionDetailDrawer: React.FC<DrawerProps> = ({ submission, onClose }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (submission) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [submission]);

  if (!submission) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(submission.code);
    alert('Code copied to clipboard!');
  };

  const getLanguageForMonaco = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('c++') || l === 'cpp') return 'cpp';
    if (l.includes('python')) return 'python';
    if (l.includes('java')) return 'java';
    if (l.includes('node') || l.includes('js')) return 'javascript';
    if (l.includes('go')) return 'go';
    return 'plaintext';
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div 
        className={styles.drawerContainer} 
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        <div className={styles.drawerHeader}>
          <h2>Submission #{submission.id}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.drawerContent}>
          {/* Left Pane - Info & Integrity */}
          <div className={styles.infoPane}>
            <div className={styles.infoSection}>
              <h4>Author & Problem</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                {submission.user.avatarUrl ? (
                  <img src={submission.user.avatarUrl} alt="avatar" className={styles.avatar} style={{ width: 40, height: 40 }} />
                ) : (
                  <div className={styles.avatar} style={{ width: 40, height: 40 }}>
                    <UserCircle2 size={24} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '1.05rem' }}>
                    {submission.user.username}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    {submission.timestamp}
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: 4 }}>Problem</div>
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {submission.problem.title} <span style={{ color: 'var(--text)', opacity: 0.5 }}>({submission.problem.id})</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h4>Execution Results</h4>
              <div className={styles.infoRow}>
                Status
                <span className={`${styles.statusBadge} ${
                  submission.status.code === 'AC' ? styles.statusAC :
                  submission.status.code === 'WA' ? styles.statusWA :
                  submission.status.code === 'TLE' ? styles.statusTLE : styles.statusErr
                }`}>
                  {submission.status.label}
                </span>
              </div>
              <div className={styles.infoRow}>
                Testcases Passed
                <span>{submission.testcasesPassed} / {submission.totalTestcases}</span>
              </div>
              <div className={styles.infoRow}>
                Runtime
                <span>{submission.runtime} ms</span>
              </div>
              <div className={styles.infoRow}>
                Memory
                <span>{submission.memory.toFixed(1)} MB</span>
              </div>
              <div className={styles.infoRow}>
                Language
                <span>{submission.language}</span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h4>Platform Integrity Report</h4>
              {submission.integrity.flag === 'Safe' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', padding: '12px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>No anomalies detected. Code appears original.</span>
                </div>
              ) : (
                <div className={`${styles.integrityAlertBox} ${submission.integrity.flag === 'AI_Flagged' ? 'AI' : submission.integrity.flag === 'Malware_Blocked' ? 'Malware' : ''}`}>
                  <h5>
                    {submission.integrity.flag === 'Malware_Blocked' ? <TerminalSquare size={20} /> : submission.integrity.flag === 'AI_Flagged' ? <Bot size={20} /> : <ShieldAlert size={20} />} 
                    {submission.integrity.flag.replace('_', ' ')} Detected!
                  </h5>
                  <p>{submission.integrity.reason}</p>
                  
                  {submission.integrity.blockedAction && (
                    <div style={{ marginBottom: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.3)', fontFamily: 'monospace', fontSize: '0.85rem', color: '#ef4444' }}>
                      [BLOCKED] {submission.integrity.blockedAction}
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: 4, fontFamily: 'sans-serif' }}>Environment: {submission.integrity.environment}</div>
                    </div>
                  )}

                  {submission.integrity.engine && (
                    <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text)' }}>
                      Detected Engine: <strong style={{ color: '#a855f7' }}>{submission.integrity.engine}</strong>
                      <span style={{ marginLeft: 12, background: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: 4, color: '#a855f7', fontWeight: 600 }}>
                        {submission.integrity.confidence}% Match
                      </span>
                    </div>
                  )}
                  
                  {submission.integrity.similarToUser && (
                    <div className={styles.suspiciousUser}>
                      <UserCircle2 size={24} style={{ color: 'var(--text)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Matches with User:</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.9rem' }}>
                          {submission.integrity.similarToUser}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>
                        {submission.integrity.confidence}% Match
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane - Code Editor */}
          <div className={styles.codePane}>
            <div className={styles.codePaneHeader}>
              <span>{submission.language} Source File</span>
              <div className={styles.codePaneActions}>
                <button 
                  onClick={handleCopy}
                  className={styles.btnOutline} 
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, borderColor: '#3c3c3c', color: '#d4d4d4' }}
                >
                  <Copy size={14} /> Copy
                </button>
                <button 
                  className={styles.btnPrimary} 
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Play size={14} /> Rejudge
                </button>
              </div>
            </div>
            <div className={styles.editorWrapper}>
              <Editor
                height="100%"
                language={getLanguageForMonaco(submission.language)}
                theme="vs-dark"
                value={submission.code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16 }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailDrawer;
