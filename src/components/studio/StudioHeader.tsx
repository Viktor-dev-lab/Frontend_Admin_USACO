import React from 'react';
import { ArrowLeft, Save, GitCommit, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudio } from './StudioContext';
import styles from '../../pages/ProblemStudio.module.css';
import problemService from '../../services/problemService';

const StudioHeader: React.FC = () => {
  const { state, dispatch } = useStudio();
  const navigate = useNavigate();

  const handleBack = () => {
    if (state.isDirty && !window.confirm('You have unsaved changes. Leave anyway?')) return;
    navigate('/problems');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_META', payload: { title: e.target.value } });
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        external_id: state.meta.external_id,
        platform_id: state.meta.platform_id,
        division_id: state.meta.division_id,
        slug: state.meta.slug,
        title: state.meta.title,
        difficulty: state.meta.difficulty,
        time_limit: state.meta.time_limit,
        memory_limit: state.meta.memory_limit,
        status: state.meta.status,
        content_en: JSON.stringify(state.statementEN),
        content_vi: JSON.stringify(state.statementVI),
        tags: state.meta.tags,
        checker_type: state.checkerConfig.type,
      };

      // Only include original_url if it's a non-empty string to avoid Ajv URI format error
      if (state.meta.original_url) {
        payload.original_url = state.meta.original_url;
      }

      if (state.problemId && state.problemId !== 'new') {
        await problemService.updateProblem(state.problemId, payload);
      } else {
        const newProblem = await problemService.createProblem(payload as any);
        dispatch({ type: 'INIT', payload: { ...state, problemId: newProblem.id } });
      }

      dispatch({ type: 'MARK_SAVED' });
      alert('Problem saved successfully!');
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save problem. Check console for details.');
    }
  };

  const statusClass =
    state.meta.status === 'ready' ? styles.statusReady :
    state.meta.status === 'review' ? styles.statusReview :
    styles.statusDraft;

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={16} />
          Problems
        </button>
        <div className={styles.headerDivider} />
        <input
          type="text"
          className={styles.titleInput}
          value={state.meta.title}
          onChange={handleTitleChange}
          placeholder="Problem Title..."
        />
        {state.isDirty && (
          <span style={{ fontSize: '0.75rem', color: 'var(--s-warning)', fontStyle: 'italic' }}>
            • unsaved
          </span>
        )}
      </div>

      <div className={styles.headerRight}>
        <div className={`${styles.statusBadge} ${statusClass}`}>
          <Circle size={8} fill="currentColor" />
          {state.meta.status}
        </div>

        <button className={styles.btnSave} onClick={handleSave}>
          <Save size={16} />
          Save
        </button>

        <button className={styles.btnCommit}>
          <GitCommit size={16} />
          Commit
        </button>
      </div>
    </header>
  );
};

export default StudioHeader;
