import React, { useState } from 'react';
import { Plus, Trash2, Code } from 'lucide-react';
import styles from '../../pages/Problems.module.css';
import type { Solution } from '../../types/problem';

interface SolutionEditorProps {
  solutions: Solution[];
  onChange: (solutions: Solution[]) => void;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({ solutions, onChange }) => {
  const [activeSolutionId, setActiveSolutionId] = useState<string | null>(solutions[0]?.id || null);

  const addSolution = () => {
    const newSolution: Solution = {
      id: Math.random().toString(36).substring(2, 9),
      language: 'cpp',
      code: '',
      explanation: ''
    };
    const newSolutions = [...solutions, newSolution];
    onChange(newSolutions);
    setActiveSolutionId(newSolution.id);
  };

  const removeSolution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSolutions = solutions.filter(s => s.id !== id);
    onChange(newSolutions);
    if (activeSolutionId === id) {
      setActiveSolutionId(newSolutions[0]?.id || null);
    }
  };

  const updateSolution = (id: string, field: keyof Solution, value: string) => {
    onChange(solutions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const activeSolution = solutions.find(s => s.id === activeSolutionId);

  return (
    <div className="fade-in">
      <div className={styles.sectionHeader} style={{ marginBottom: 16 }}>
        <h3>Official Solutions</h3>
        <button type="button" onClick={addSolution} className={styles.btnEditorOutline}>
          <Plus size={16} /> Add Solution
        </button>
      </div>

      {solutions.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#18181b', borderRadius: 8, border: '1px dashed #3f3f46', color: '#a1a1aa' }}>
          <Code size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
          <p>No official solutions provided yet.</p>
          <button type="button" onClick={addSolution} className={styles.btnEditorPrimary} style={{ marginTop: 16 }}>
            Add First Solution
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, minHeight: 500 }}>
          {/* Sidebar for solutions */}
          <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {solutions.map((sol, index) => (
              <div 
                key={sol.id} 
                onClick={() => setActiveSolutionId(sol.id)}
                style={{ 
                  padding: '12px 16px', 
                  background: activeSolutionId === sol.id ? '#312e81' : '#18181b',
                  border: `1px solid ${activeSolutionId === sol.id ? '#4338ca' : '#27272a'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: activeSolutionId === sol.id ? '#f8fafc' : '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Solution #{index + 1}</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{sol.language}</span>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => removeSolution(sol.id, e)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor for active solution */}
          {activeSolution && (
            <div style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Programming Language</label>
                <select 
                  value={activeSolution.language} 
                  onChange={(e) => updateSolution(activeSolution.id, 'language', e.target.value)}
                  className={styles.select}
                  style={{ width: '200px' }}
                >
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java 17</option>
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Source Code</label>
                <textarea
                  value={activeSolution.code}
                  onChange={(e) => updateSolution(activeSolution.id, 'code', e.target.value)}
                  className={styles.textarea}
                  style={{ flex: 1, minHeight: 300, fontFamily: "'Fira Code', monospace", fontSize: '0.9rem', background: '#0a0a0b', color: '#e5e7eb' }}
                  placeholder="Paste official solution code here..."
                  spellCheck={false}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Explanation (Markdown)</label>
                <textarea
                  value={activeSolution.explanation}
                  onChange={(e) => updateSolution(activeSolution.id, 'explanation', e.target.value)}
                  className={styles.textarea}
                  style={{ minHeight: 150 }}
                  placeholder="Explain the approach, time complexity, and space complexity..."
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolutionEditor;
