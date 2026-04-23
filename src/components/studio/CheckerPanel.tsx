import React from 'react';
import { ShieldCheck, Play, Save, Loader2 } from 'lucide-react';
import { useStudio } from './StudioContext';
import MonacoWrapper from './MonacoWrapper';
import problemService from '../../services/problemService';
import styles from '../../pages/ProblemStudio.module.css';
import type { CheckerType } from '../../types/studio';

const CheckerPanel: React.FC = () => {
  const { state, dispatch } = useStudio();
  const [saving, setSaving] = React.useState(false);
  const config = state.checkerConfig;

  const setType = (type: CheckerType) => {
    dispatch({ type: 'SET_CHECKER', payload: { type } });
  };

  const toggleDiffOption = (key: keyof typeof config.diffOptions) => {
    dispatch({
      type: 'SET_CHECKER',
      payload: {
        diffOptions: { ...config.diffOptions, [key]: !config.diffOptions[key] },
      },
    });
  };

  const handleSaveScripts = async () => {
    if (!state.problemId) return;
    try {
      setSaving(true);
      await problemService.updateScripts(state.problemId, {
        checker_code: config.customCode,
        validator_code: state.validatorCode,
      });
      alert('Checker & Validator updated!');
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
        <div className="icon"><ShieldCheck size={20} /></div>
        <h2>Checker & Validator</h2>
        <button 
          className={styles.btnPrimary} 
          style={{ marginLeft: 'auto', gap: 8 }}
          onClick={handleSaveScripts}
          disabled={saving}
        >
          {saving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />}
          Save Scripts
        </button>
      </div>
      <p className={styles.sectionDescription}>
        Configure how submissions are judged. Use the standard diff checker for exact-match problems,
        or write a custom checker for problems with multiple valid answers.
      </p>

      {/* ── Checker Type Selection ── */}
      <div className={styles.card} style={{ marginBottom: 24 }}>
        <h3 style={{ color: 'var(--s-text-h)', margin: '0 0 16px', fontSize: '1rem' }}>Checker Type</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div
            className={`${styles.checkerOption} ${config.type === 'default_diff' ? styles.checkerOptionActive : ''}`}
            onClick={() => setType('default_diff')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${config.type === 'default_diff' ? 'var(--s-accent)' : 'var(--s-border-light)'}`,
                background: config.type === 'default_diff' ? 'var(--s-accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {config.type === 'default_diff' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
              </div>
              <h4 style={{ margin: 0 }}>Standard Diff</h4>
            </div>
            <p>Compare participant output with expected output line by line. Suitable for problems with a unique answer.</p>

            {config.type === 'default_diff' && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--s-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.diffOptions.ignoreTrailingWhitespace}
                    onChange={() => toggleDiffOption('ignoreTrailingWhitespace')} />
                  Ignore trailing whitespace
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--s-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.diffOptions.ignoreTrailingNewlines}
                    onChange={() => toggleDiffOption('ignoreTrailingNewlines')} />
                  Ignore trailing newlines
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--s-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={config.diffOptions.caseInsensitive}
                    onChange={() => toggleDiffOption('caseInsensitive')} />
                  Case insensitive comparison
                </label>
              </div>
            )}
          </div>

          <div
            className={`${styles.checkerOption} ${config.type === 'custom_checker' ? styles.checkerOptionActive : ''}`}
            onClick={() => setType('custom_checker')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${config.type === 'custom_checker' ? 'var(--s-accent)' : 'var(--s-border-light)'}`,
                background: config.type === 'custom_checker' ? 'var(--s-accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {config.type === 'custom_checker' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
              </div>
              <h4 style={{ margin: 0 }}>Custom Checker</h4>
            </div>
            <p>Write custom checking logic (e.g. using testlib.h) for interactive or multi-answer problems.</p>
          </div>
        </div>
      </div>

      {/* ── Custom Checker Editor ── */}
      {config.type === 'custom_checker' && (
        <div className={styles.card} style={{ marginBottom: 24 }}>
          <div className={styles.cardHeader}>
            <h3>Custom Checker Code</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={config.customLanguage}
                onChange={(e) => dispatch({ type: 'SET_CHECKER', payload: { customLanguage: e.target.value } })}
                className={styles.select}
                style={{ width: 150 }}
              >
                <option value="cpp">C++ (GCC)</option>
                <option value="python">Python 3</option>
              </select>
              <button className={styles.btnSuccess}>
                <Play size={14} /> Test Checker
              </button>
            </div>
          </div>
          <div className={styles.editorContainer}>
            <MonacoWrapper
              value={config.customCode}
              onChange={(val) => dispatch({ type: 'SET_CODE', payload: { target: 'checker', code: val } })}
              language={config.customLanguage}
              height="350px"
            />
          </div>
        </div>
      )}

      {/* ── Validator Editor ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Input Validator</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={state.validatorLanguage}
              onChange={(e) => dispatch({ type: 'SET_CODE', payload: { target: 'validator', code: state.validatorCode, language: e.target.value } })}
              className={styles.select}
              style={{ width: 150 }}
            >
              <option value="cpp">C++ (GCC)</option>
              <option value="python">Python 3</option>
            </select>
            <button className={styles.btnSuccess}>
              <Play size={14} /> Quick Test
            </button>
            <button className={styles.btnPrimary}>
              Validate All Tests
            </button>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--s-text-dim)', marginBottom: 16 }}>
          Validates that generated inputs conform to constraints. Returns exit code 0 for valid input, non-zero for invalid.
        </p>
        <div className={styles.editorContainer}>
          <MonacoWrapper
            value={state.validatorCode}
            onChange={(val) => dispatch({ type: 'SET_CODE', payload: { target: 'validator', code: val } })}
            language={state.validatorLanguage}
            height="350px"
          />
        </div>
      </div>
    </div>
  );
};

export default CheckerPanel;
