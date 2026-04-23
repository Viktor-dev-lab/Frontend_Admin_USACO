import React from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import styles from '../../pages/Problems.module.css';
import type { Testcase } from '../../types/problem';

interface TestcaseManagerProps {
  testcases: Testcase[];
  onChange: (testcases: Testcase[]) => void;
}

const TestcaseManager: React.FC<TestcaseManagerProps> = ({ testcases, onChange }) => {
  const addTestcase = () => {
    const newTestcase: Testcase = {
      id: Math.random().toString(36).substring(2, 9),
      input: '',
      output: '',
      isHidden: false
    };
    onChange([...testcases, newTestcase]);
  };

  const removeTestcase = (id: string) => {
    onChange(testcases.filter(tc => tc.id !== id));
  };

  const updateTestcase = (id: string, field: keyof Testcase, value: any) => {
    onChange(testcases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  return (
    <div className="fade-in">
      <div className={styles.sectionHeader}>
        <h3>Testcases</h3>
        <button type="button" onClick={addTestcase} className={styles.btnEditorOutline}>
          <Plus size={16} /> Add Testcase
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {testcases.map((tc, index) => (
          <div key={tc.id} className={styles.exampleBlock}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ margin: 0, color: '#f8fafc' }}>Testcase #{index + 1}</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => updateTestcase(tc.id, 'isHidden', !tc.isHidden)}
                  className={styles.btnEditorOutline}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  {tc.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  {tc.isHidden ? 'Hidden' : 'Public'}
                </button>
                <button
                  type="button"
                  onClick={() => removeTestcase(tc.id)}
                  className={styles.btnRemoveExample}
                  style={{ position: 'static' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Input Data</label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateTestcase(tc.id, 'input', e.target.value)}
                  className={styles.textarea}
                  style={{ minHeight: 120, fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Enter standard input..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expected Output</label>
                <textarea
                  value={tc.output}
                  onChange={(e) => updateTestcase(tc.id, 'output', e.target.value)}
                  className={styles.textarea}
                  style={{ minHeight: 120, fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Enter expected standard output..."
                />
              </div>
            </div>
          </div>
        ))}

        {testcases.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', background: '#18181b', borderRadius: 8, border: '1px dashed #3f3f46', color: '#a1a1aa' }}>
            <p>No testcases configured for this problem yet.</p>
            <button type="button" onClick={addTestcase} className={styles.btnEditorPrimary} style={{ marginTop: 16 }}>
              <Plus size={16} /> Add First Testcase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestcaseManager;
