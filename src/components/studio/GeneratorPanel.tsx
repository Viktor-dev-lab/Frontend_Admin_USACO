import React from 'react';
import { Plus, Play, Save, Loader2 } from 'lucide-react';
import { useStudio } from './StudioContext';
import MonacoWrapper from './MonacoWrapper';
import problemService from '../../services/problemService';
import styles from '../../pages/ProblemStudio.module.css';

const GeneratorPanel: React.FC = () => {
  const { state, dispatch } = useStudio();
  const [saving, setSaving] = React.useState(false);

  const handleSaveGenerator = async () => {
    if (!state.problemId) return;
    try {
      setSaving(true);
      await problemService.updateScripts(state.problemId, {
        generator_code: state.generatorCode
      });
      alert('Generator updated!');
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
        <div className="icon"><Plus size={20} /></div>
        <h2>Testcase Generator</h2>
        <button 
          className={styles.btnPrimary} 
          style={{ marginLeft: 'auto', gap: 8 }}
          onClick={handleSaveGenerator}
          disabled={saving}
        >
          {saving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />}
          Save Generator
        </button>
      </div>
      <p className={styles.sectionDescription}>
        Write a random testcase generator (usually in C++). This code is used to automatically generate 
        large testcases or mass-validate constraints.
      </p>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Generator Code (C++)</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={state.generatorLanguage}
              onChange={(e) => dispatch({ type: 'SET_CODE', payload: { target: 'generator', code: state.generatorCode, language: e.target.value } })}
              className={styles.select}
              style={{ width: 150 }}
            >
              <option value="cpp">C++ (GCC)</option>
              <option value="python">Python 3</option>
            </select>
            <button className={styles.btnSuccess}>
              <Play size={14} /> Run Generator
            </button>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--s-text-dim)', marginBottom: 16 }}>
          Standard generator should take a seed as a command line argument and output a testcase to stdout.
        </p>
        <div className={styles.editorContainer}>
          <MonacoWrapper
            value={state.generatorCode}
            onChange={(val) => dispatch({ type: 'SET_CODE', payload: { target: 'generator', code: val } })}
            language={state.generatorLanguage}
            height="500px"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneratorPanel;
