import React, { useState } from 'react';
import { Code2, Plus, Trash2, Play, Zap, Save, Loader2 } from 'lucide-react';
import { useStudio } from './StudioContext';
import MonacoWrapper from './MonacoWrapper';
import problemService from '../../services/problemService';
import styles from '../../pages/ProblemStudio.module.css';
import type { Solution } from '../../types/problem';

const SolutionPanel: React.FC = () => {
  const { state, dispatch } = useStudio();
  const [activeId, setActiveId] = useState<string | null>(state.solutions[0]?.id || null);
  const [runResult, setRunResult] = useState<{ verdict: string; time: string; output: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const solutions = state.solutions;
  const activeSolution = solutions.find(s => s.id === activeId);

  const addSolution = () => {
    const newSol: Solution = {
      id: Math.random().toString(36).substring(2, 9),
      language: 'cpp',
      code: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
      explanation: '',
    };
    dispatch({ type: 'SET_SOLUTIONS', payload: [...solutions, newSol] });
    setActiveId(newSol.id);
  };

  const removeSolution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = solutions.filter(s => s.id !== id);
    dispatch({ type: 'SET_SOLUTIONS', payload: next });
    if (activeId === id) setActiveId(next[0]?.id || null);
  };

  const updateSolution = (field: keyof Solution, value: string) => {
    if (!activeSolution) return;
    dispatch({
      type: 'SET_SOLUTIONS',
      payload: solutions.map(s => s.id === activeId ? { ...s, [field]: value } : s),
    });
  };

  const handleRun = () => {
    // Mock run result for now
    setRunResult({ verdict: '✓ Accepted', time: '45ms', output: '2\n1 1' });
  };

  const handleSaveOfficial = async () => {
    if (!state.problemId) return;
    try {
      setSaving(true);
      await problemService.updateScripts(state.problemId, {
        solution_code: state.officialSolutionCode
      });
      alert('Official solution updated!');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.fadeIn}>
      <div className={styles.sectionTitle}>
        <div className="icon"><Code2 size={20} /></div>
        <h2>Solutions</h2>
      </div>
      <p className={styles.sectionDescription}>
        Manage solutions for this problem. The <strong>Official Standard Solution</strong> is used by the system to generate expected outputs (.out files) from inputs.
      </p>

      {/* ── Official Standard Solution (for Workers) ── */}
      <div className={styles.card} style={{ marginBottom: 32, borderLeft: '4px solid var(--s-accent)' }}>
        <div className={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="var(--s-accent)" />
            <h3 style={{ margin: 0 }}>Official Standard Solution (C++)</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={styles.btnSuccess}>
              <Play size={14} /> Test on Samples
            </button>
            <button 
              className={styles.btnPrimary} 
              style={{ gap: 8 }}
              onClick={handleSaveOfficial}
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />}
              Save Official Code
            </button>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--s-text-dim)', marginBottom: 16 }}>
          This code must be in C++. It is used as the reference implementation to generate official outputs.
        </p>
        <div className={styles.editorContainer}>
          <MonacoWrapper
            value={state.officialSolutionCode}
            onChange={(val) => dispatch({ type: 'SET_CODE', payload: { target: 'solution', code: val } })}
            language="cpp"
            height="350px"
          />
        </div>
      </div>

      <div className={styles.sectionTitle} style={{ marginTop: 40, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Public Explanations & Alternate Solutions</h3>
      </div>

      {solutions.length === 0 ? (
        <div className={styles.emptyState}>
          <Code2 size={40} />
          <p>No solutions yet. Add a model solution to get started.</p>
          <button onClick={addSolution} className={styles.btnPrimary}>
            <Plus size={16} /> Add First Solution
          </button>
        </div>
      ) : (
        <div className={styles.solutionLayout}>
          {/* Sidebar */}
          <div className={styles.solutionSidebar}>
            {solutions.map((sol, idx) => (
              <div
                key={sol.id}
                className={`${styles.solutionTab} ${activeId === sol.id ? styles.solutionTabActive : ''}`}
                onClick={() => setActiveId(sol.id)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Solution #{idx + 1}</div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', marginTop: 2 }}>{sol.language}</div>
                </div>
                <button
                  onClick={(e) => removeSolution(sol.id, e)}
                  style={{ background: 'none', border: 'none', color: 'var(--s-danger)', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={addSolution} className={styles.btnOutline} style={{ justifyContent: 'center', marginTop: 8 }}>
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Editor */}
          {activeSolution && (
            <div className={styles.solutionEditor}>
              {/* Language selector */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select
                  value={activeSolution.language}
                  onChange={(e) => updateSolution('language', e.target.value)}
                  className={styles.select}
                  style={{ width: 180 }}
                >
                  <option value="cpp">C++ (GCC 17)</option>
                  <option value="java">Java 17</option>
                  <option value="python">Python 3.11</option>
                  <option value="javascript">JavaScript (Node)</option>
                </select>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className={styles.btnSuccess} onClick={handleRun}>
                    <Play size={14} /> Run on Sample
                  </button>
                  <button className={styles.btnPrimary}>
                    <Zap size={14} /> Run All Tests
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className={styles.editorContainer}>
                <MonacoWrapper
                  value={activeSolution.code}
                  onChange={(val) => updateSolution('code', val)}
                  language={activeSolution.language === 'cpp' ? 'cpp' : activeSolution.language}
                  height="400px"
                />
              </div>

              {/* Run Result */}
              {runResult && (
                <div className={`${styles.verdictBox} ${styles.verdictAC}`}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--s-success)' }}>
                      {runResult.verdict}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--s-text)' }}>Time: {runResult.time}</span>
                  </div>
                  <pre className={styles.monoPreview} style={{ marginTop: 12 }}>
                    {runResult.output}
                  </pre>
                </div>
              )}

              {/* Explanation */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Approach Explanation (Markdown)</label>
                <textarea
                  value={activeSolution.explanation}
                  onChange={(e) => updateSolution('explanation', e.target.value)}
                  className={styles.textarea}
                  style={{ minHeight: 120 }}
                  placeholder="Explain the algorithm, time complexity, key observations..."
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolutionPanel;
