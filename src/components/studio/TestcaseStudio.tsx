import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Database, Plus, Trash2, Play, Zap, CheckCircle, XCircle, Clock,
  AlertTriangle, GripVertical, Upload, Eye, MoreVertical, Download,
  RefreshCw, FileText, X, Pencil, Save, Star, Search, Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useStudio } from './StudioContext';
import testcaseService from '../../services/testcaseService';
import MonacoWrapper from './MonacoWrapper';
import styles from '../../pages/ProblemStudio.module.css';
import type { TestcaseExtended, Constraint, ConstraintType, GenerationStep, StorageFile } from '../../types/studio';

/* ═══════════════════════════════════════════════════
   FilePreviewModal
   ═══════════════════════════════════════════════════ */
interface PreviewModalProps {
  fileName: string;
  onClose: () => void;
  problemId: string;
}

const FilePreviewModal: React.FC<PreviewModalProps> = ({ fileName, onClose, problemId }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const text = await testcaseService.previewFile(problemId, fileName);
        setContent(text);
      } catch (err) {
        setError('Failed to load file content. It might be too large (> 512KB) or unreachable.');
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [problemId, fileName]);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Create a File from the current content to reuse the upload logic
      const file = new File([content], fileName, { type: 'text/plain' });
      await testcaseService.uploadFile(problemId, fileName, file);
      onClose(); // Close modal on success
    } catch (err) {
      alert('Failed to save changes to storage');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.premiumModalOverlay} onClick={onClose}>
      <div className={styles.premiumModal} style={{ maxWidth: '800px', height: '80vh' }} onClick={e => e.stopPropagation()}>
        <div className={styles.premiumModalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 6, background: 'var(--s-bg-3)', borderRadius: 6, color: 'var(--s-accent)' }}>
              <Pencil size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--s-text-h)' }}>Edit: {fileName}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--s-text-dim)' }}>Directly edit file content on Bunny Storage</span>
            </div>
          </div>
          <button onClick={onClose} className={styles.btnIcon}><X size={20} /></button>
        </div>

        <div className={styles.premiumModalBody} style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--s-text-dim)' }}>
              <Loader2 size={32} className={styles.spin} />
              <span>Fetching content from storage...</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 40, textAlign: 'center' }}>
              <AlertTriangle size={48} style={{ color: 'var(--s-warning)' }} />
              <p style={{ color: 'var(--s-text-h)', fontWeight: 500 }}>{error}</p>
              <button onClick={onClose} className={styles.btnOutline}>Close Preview</button>
            </div>
          ) : (
            <div style={{ height: '100%' }}>
              <MonacoWrapper
                value={content}
                onChange={setContent}
                readOnly={false}
                language="plaintext"
                height="100%"
              />
            </div>
          )}
        </div>

        <div className={styles.premiumModalFooter}>
          <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
            <button onClick={onClose} className={styles.btnOutline} disabled={saving}>Cancel</button>
            <button onClick={handleSave} className={styles.btnPrimary} style={{ gap: 8 }} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className={styles.spin} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   PairedTestcase Definition
   ═══════════════════════════════════════════════════ */
interface PairedTestcase {
  prefix: string;
  inputFile?: StorageFile;
  outputFile?: StorageFile;
  dbConfig?: TestcaseConfig;
}

/* ═══════════════════════════════════════════════════
   TestcaseTable (Bunny Storage Integrated)
   ═══════════════════════════════════════════════════ */
const TestcaseTable: React.FC = () => {
  const { state, dispatch } = useStudio();
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string[]>([]); // Track files being uploaded

  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<TestcaseConfig>>>({});

  const problemId = state.problemId;

  // Load files from storage and DB on mount
  const refreshFiles = useCallback(async (showLoading = true) => {
    if (!problemId) return;
    try {
      if (showLoading) setLoading(true);
      const [files, dbCases] = await Promise.all([
        testcaseService.listFiles(problemId),
        testcaseService.listDbTestcases(problemId)
      ]);
      dispatch({ type: 'SET_STORAGE_FILES', payload: files });
      dispatch({ type: 'SET_DB_TESTCASES', payload: dbCases });
      setPendingChanges({}); // Clear pending changes on fresh sync
    } catch (err) {
      console.error('Failed to sync testcase data', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [problemId, dispatch]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  // Handle local data changes before saving
  const handleLocalChange = (prefix: string, updates: Partial<TestcaseConfig>) => {
    setPendingChanges(prev => ({
      ...prev,
      [prefix]: { ...(prev[prefix] || {}), ...updates }
    }));
  };

  const handleSaveMetadata = async (prefix: string, directUpdates?: Partial<TestcaseConfig>) => {
    if (!problemId) return;
    const pair = pairedData.find(p => p.prefix === prefix);
    if (!pair?.dbConfig) return;

    const updates = directUpdates || pendingChanges[prefix];
    if (!updates) return;

    try {
      setLoading(true);
      await testcaseService.updateDbTestcase(problemId, pair.dbConfig.id, updates);
      await refreshFiles(false);
    } catch (err) {
      alert('Failed to update metadata');
    } finally {
      setLoading(false);
    }
  };

  // Pairing Logic
  const pairedData = useMemo(() => {
    const pairs: Record<string, PairedTestcase> = {};

    // 1. Map physical storage files
    state.storageFiles.forEach(file => {
      const isInput = file.ObjectName.endsWith('.in');
      const isOutput = file.ObjectName.endsWith('.out');
      if (!isInput && !isOutput) return;

      const prefix = file.ObjectName.replace(/\.(in|out)$/, '');
      if (!pairs[prefix]) pairs[prefix] = { prefix };

      if (isInput) pairs[prefix].inputFile = file;
      if (isOutput) pairs[prefix].outputFile = file;
    });

    // 2. Link database metadata
    state.dbTestcases.forEach(dbCase => {
      // Find the pair that matches this database entry
      // Usually input_file_url matches ObjectName (e.g. "1.in")
      const prefix = dbCase.input_file_url.replace(/\.in$/, '');
      if (pairs[prefix]) {
        pairs[prefix].dbConfig = dbCase;
      } else {
        // Orphaned DB record (file missing from storage)
        pairs[prefix] = { prefix, dbConfig: dbCase };
      }
    });

    // 3. Sort logic: Use DB order if available, otherwise natural prefix sorting
    return Object.values(pairs).sort((a, b) => {
      const orderA = a.dbConfig?.order ?? 9999;
      const orderB = b.dbConfig?.order ?? 9999;
      
      if (orderA !== orderB) return orderA - orderB;

      const numA = parseInt(a.prefix);
      const numB = parseInt(b.prefix);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.prefix.localeCompare(b.prefix);
    });
  }, [state.storageFiles, state.dbTestcases]);

  // Actions
  const handleDelete = async (prefix: string) => {
    if (!problemId || !window.confirm(`Are you sure you want to delete all files for testcase "${prefix}"?`)) return;
    try {
      setLoading(true);
      const pair = pairedData.find(p => p.prefix === prefix);
      if (pair?.inputFile) await testcaseService.deleteFile(problemId, pair.inputFile.ObjectName);
      if (pair?.outputFile) await testcaseService.deleteFile(problemId, pair.outputFile.ObjectName);
      await refreshFiles();
    } catch (err) {
      alert('Failed to delete files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    if (!problemId) return;
    try {
      await testcaseService.downloadFile(problemId, fileName);
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleDeleteAll = async () => {
    if (!problemId || !window.confirm('WARNING: This will permanently delete ALL testcase files from storage for this problem. Continue?')) return;
    try {
      setLoading(true);
      await testcaseService.deleteFile(problemId);
      await refreshFiles();
    } catch (err) {
      alert('Failed to clear storage');
    } finally {
      setLoading(false);
    }
  };


  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    if (!problemId) return;

    console.log('Accepted files:', acceptedFiles.map(f => f.name));
    if (fileRejections.length > 0) {
      console.warn('Rejected files:', fileRejections);
    }

    // Modern Windows sometimes hides .txt, resulting in filenames like '1.in.txt'.
    // We filter for .in, .out, or files containing .in. / .out.
    const validFiles = acceptedFiles.filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.in') || 
             name.endsWith('.out') || 
             name.endsWith('.in.txt') || 
             name.endsWith('.out.txt');
    });

    if (validFiles.length === 0) {
      const names = acceptedFiles.map(f => f.name).join(', ');
      alert(`Invalid file types. Detected names: ${names || 'none'}. Please use .in or .out extensions.`);
      return;
    }

    setUploading(validFiles.map(f => f.name));

    try {
      for (const file of validFiles) {
        // Automatically strip .txt if present (e.g. 1.in.txt -> 1.in)
        const targetName = file.name.replace(/\.txt$/i, '');
        await testcaseService.uploadFile(problemId, targetName, file);
      }
      await refreshFiles();
    } catch (err) {
      alert('Failed to upload some files. Check connection or filename duplicates.');
    } finally {
      setUploading([]);
    }
  }, [problemId, refreshFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    // Note: 'accept' is intentionally omitted to avoid browser MIME-type filtering issues.
  });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--s-text-h)', fontWeight: 600 }}>
          <Database size={18} />
          <span>Storage Files</span>
        </div>
        <button onClick={refreshFiles} className={styles.btnIcon} disabled={loading} title="Sync with Storage">
          <RefreshCw size={16} className={loading ? styles.spin : ''} />
        </button>
        <button onClick={handleDeleteAll} className={styles.btnIcon} disabled={loading || state.storageFiles.length === 0} title="Clear All Storage Files" style={{ color: 'var(--s-danger)' }}>
          <Trash2 size={16} />
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--s-text-dim)' }}>
          {pairedData.length} pairs • {state.storageFiles.length} files
        </span>
      </div>

      <div style={{ border: '1px solid var(--s-border)', borderRadius: '8px', overflowX: 'auto', marginBottom: 24, background: 'var(--s-bg-1)' }}>
        <table className={styles.premiumTable} style={{ minWidth: '950px' }}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th style={{ width: 60, textAlign: 'center' }} title="Sample Testcase"><Star size={14} /></th>
              <th style={{ width: 200 }}>Input File (.in)</th>
              <th style={{ width: 200 }}>Output File (.out)</th>
              <th style={{ width: 100 }}>Points</th>
              <th style={{ width: 100 }}>Size</th>
              <th style={{ width: 100, textAlign: 'center' }}>Status</th>
              <th style={{ width: 120, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pairedData.map((pair) => (
              <tr key={pair.prefix}>
                {/* Order / Index */}
                <td>
                  {pair.dbConfig ? (
                    <input 
                      type="number" 
                      value={pendingChanges[pair.prefix]?.order ?? pair.dbConfig.order}
                      onChange={(e) => handleLocalChange(pair.prefix, { order: parseInt(e.target.value) })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveMetadata(pair.prefix)}
                      className={styles.inputSmall}
                      style={{ width: '50px', padding: '4px 8px', background: 'var(--s-bg-2)', border: '1px solid var(--s-border)', borderRadius: '4px', color: 'inherit', textAlign: 'center' }}
                    />
                  ) : (
                    <span style={{ opacity: 0.5 }}>{pair.prefix}</span>
                  )}
                </td>

                {/* Sample Toggle */}
                <td style={{ textAlign: 'center' }}>
                  {pair.dbConfig ? (
                    <button 
                      onClick={() => handleSaveMetadata(pair.prefix, { is_sample: !pair.dbConfig!.is_sample })}
                      className={`${styles.starBtn} ${pair.dbConfig.is_sample ? styles.starBtnActive : ''}`}
                    >
                      <Star size={16} fill={pair.dbConfig.is_sample ? "currentColor" : "none"} />
                    </button>
                  ) : (
                    <div style={{ color: 'var(--s-warning)' }} title="Not in DB"><AlertTriangle size={14} /></div>
                  )}
                </td>
                
                <td>
                  {pair.inputFile ? (
                    <div className={styles.filePill}>
                      <FileText size={14} />
                      <span>{pair.inputFile.ObjectName}</span>
                      <button onClick={() => setPreviewFile(pair.inputFile!.ObjectName)} title="Preview"><Eye size={12} /></button>
                      <button onClick={() => handleDownload(pair.inputFile!.ObjectName)} title="Download"><Download size={12} /></button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--s-warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={14} /> Missing .in
                    </span>
                  )}
                </td>

                <td>
                  {pair.outputFile ? (
                    <div className={styles.filePill}>
                      <FileText size={14} />
                      <span>{pair.outputFile.ObjectName}</span>
                      <button onClick={() => setPreviewFile(pair.outputFile!.ObjectName)} title="Preview"><Eye size={12} /></button>
                      <button onClick={() => handleDownload(pair.outputFile!.ObjectName)} title="Download"><Download size={12} /></button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--s-warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={14} /> Missing .out
                    </span>
                  )}
                </td>

                {/* Points */}
                <td>
                  {pair.dbConfig ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input 
                        type="number" 
                        value={pendingChanges[pair.prefix]?.points ?? pair.dbConfig.points}
                        onChange={(e) => handleLocalChange(pair.prefix, { points: parseInt(e.target.value) })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveMetadata(pair.prefix)}
                        style={{ width: '60px', padding: '4px 8px', background: 'var(--s-bg-2)', border: '1px solid var(--s-border)', borderRadius: '4px', color: 'inherit' }}
                      />
                      {pendingChanges[pair.prefix] && (
                        <button onClick={() => handleSaveMetadata(pair.prefix)} className={styles.btnIcon} style={{ color: 'var(--s-success)' }} title="Save Changes">
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ opacity: 0.5 }}>-</span>
                       <button className={styles.btnOutline} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Sync DB</button>
                    </div>
                  )}
                </td>

                <td style={{ fontSize: '0.85rem', color: 'var(--s-text-dim)' }}>
                  {formatBytes((pair.inputFile?.Length || 0) + (pair.outputFile?.Length || 0))}
                </td>

                <td style={{ textAlign: 'center' }}>
                   {pair.inputFile && pair.outputFile ? (
                     <div title="Healthy Pair" style={{ display: 'inline-flex', padding: 4, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)' }}>
                       <CheckCircle size={16} color="#34d399" />
                     </div>
                   ) : (
                     <div title="Incomplete Pair" style={{ display: 'inline-flex', padding: 4, borderRadius: '50%', background: 'rgba(251, 191, 36, 0.15)' }}>
                       <AlertTriangle size={16} color="#fbbf24" />
                     </div>
                   )}
                </td>

                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button onClick={() => handleDelete(pair.prefix)} className={styles.actionBtnGhost} style={{ color: '#ef4444' }} title="Delete Pair">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pairedData.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--s-text-dim)' }}>
                  <Database size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <p>No files found on Bunny Storage for this problem.</p>
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 size={24} className={styles.spin} style={{ marginRight: 8 }} />
                  Syncing storage...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${uploading.length > 0 ? styles.dropzoneDisabled : ''}`}>
        <input {...getInputProps()} disabled={uploading.length > 0} />
        {uploading.length > 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={24} className={styles.spin} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Uploading {uploading.length} files...</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--s-text-dim)', marginTop: 4 }}>
              Current: {uploading[0]}
            </div>
          </div>
        ) : (
          <>
            <Upload size={24} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>
              {isDragActive ? 'Drop files now' : 'Upload Test Data'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--s-text-dim)' }}>
              Drag & Drop <b>.in</b> and <b>.out</b> files here. Filenames must match (e.g. 1.in, 1.out).
            </div>
          </>
        )}
      </div>

      {previewFile && problemId && (
        <FilePreviewModal
          fileName={previewFile}
          problemId={problemId}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════
   TestcaseStudio Main
   ═══════════════════════════════════════════════════ */
const TestcaseStudio: React.FC = () => {
  return (
    <div className={styles.fadeIn}>
      <div className={styles.sectionTitle}>
        <div className="icon"><Database size={20} /></div>
        <h2>Testcase Studio</h2>
      </div>
      <p className={styles.sectionDescription}>
        Manage physical test data stored on Bunny Storage. Files are automatically paired by filename.
        Maximum file size for preview is 512KB.
      </p>

      <TestcaseTable />
    </div>
  );
};

export default TestcaseStudio;
