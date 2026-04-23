import React from 'react';
import { Wifi, Clock, Database, Code2 } from 'lucide-react';
import { useStudio } from './StudioContext';
import styles from '../../pages/ProblemStudio.module.css';

const StudioStatusBar: React.FC = () => {
  const { state } = useStudio();

  const lastSaved = state.lastSavedAt
    ? new Date(state.lastSavedAt).toLocaleTimeString()
    : 'Never';

  return (
    <footer className={styles.statusBar}>
      <div className={styles.statusItem}>
        <div className={`${styles.statusDot} ${styles.statusDotGreen}`} />
        <span>Judge0 Connected</span>
      </div>

      <div className={styles.statusItem}>
        <Clock size={12} />
        <span>Last saved: {lastSaved}</span>
      </div>

      <div className={styles.statusItem}>
        <Database size={12} />
        <span>{state.testcases.length} testcase(s)</span>
      </div>

      <div className={styles.statusItem}>
        <Code2 size={12} />
        <span>
          {state.meta.time_limit} / {state.meta.memory_limit}
        </span>
      </div>

      <div style={{ marginLeft: 'auto' }} className={styles.statusItem}>
        <span>{state.meta.platforms} · {state.meta.divisions}</span>
      </div>
    </footer>
  );
};

export default StudioStatusBar;
