import React, { useState } from 'react';
import {
  Settings, FileText, ShieldCheck, Code2, Database,
  CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { useStudio } from './StudioContext';
import styles from '../../pages/ProblemStudio.module.css';
import type { StudioTab } from '../../types/studio';

interface NavItem {
  id: StudioTab;
  icon: React.ReactNode;
  label: string;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general',   icon: <Settings size={18} />,    label: 'General Info',        section: 'Configuration' },
  { id: 'statement', icon: <FileText size={18} />,    label: 'Statement',            section: 'Configuration' },
  { id: 'checker',   icon: <ShieldCheck size={18} />, label: 'Checker / Validator',  section: 'Evaluation' },
  { id: 'generator', icon: <Plus size={18} />,        label: 'Generator',            section: 'Evaluation' },
  { id: 'solutions', icon: <Code2 size={18} />,       label: 'Solutions',            section: 'Evaluation' },
  { id: 'testcases', icon: <Database size={18} />,    label: 'Testcases',            section: 'Evaluation' },
];

const StudioSidebar: React.FC = () => {
  const { state, dispatch } = useStudio();
  const [collapsed, setCollapsed] = useState(false);

  const getBadge = (id: StudioTab): { text: string; warn: boolean } | null => {
    switch (id) {
      case 'solutions':
        return state.solutions.length > 0 ? { text: String(state.solutions.length), warn: false } : null;
      case 'testcases':
        return state.testcases.length > 0 ? { text: String(state.testcases.length), warn: false } : null;
      case 'checker':
        return state.checkerConfig.type === 'custom_checker' && !state.checkerConfig.customCode
          ? { text: '!', warn: true } : null;
      default:
        return null;
    }
  };

  let lastSection = '';

  return (
    <aside
      className={styles.sidebar}
      style={{
        width: collapsed ? 56 : 240,
        minWidth: collapsed ? 56 : 240,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Toggle button pinned to top */}
      <div style={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-end',
        padding: '10px 8px 4px',
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={styles.navItem}
          style={{
            width: 32, height: 32, padding: 0,
            justifyContent: 'center',
            borderRadius: 6,
            flexShrink: 0,
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const showSection = !collapsed && item.section !== lastSection;
        lastSection = item.section;
        const badge = getBadge(item.id);
        const isActive = state.activeTab === item.id;

        return (
          <React.Fragment key={item.id}>
            {showSection && (
              <div className={styles.sidebarSection}>{item.section}</div>
            )}
            <nav className={styles.sidebarNav}>
              <button
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
                title={collapsed ? item.label : undefined}
                style={{ justifyContent: collapsed ? 'center' : undefined }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>

                {/* Label — hidden when collapsed */}
                {!collapsed && (
                  <>
                    <span style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.label}
                    </span>
                    {badge && (
                      <span className={`${styles.navBadge} ${badge.warn ? styles.navBadgeWarn : ''}`}>
                        {badge.text}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed mode: show badge as dot on icon */}
                {collapsed && badge && (
                  <span style={{
                    position: 'absolute',
                    top: 5, right: 5,
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: badge.warn ? 'var(--s-warning)' : 'var(--s-accent)',
                  }} />
                )}
              </button>
            </nav>
          </React.Fragment>
        );
      })}

      {/* Validation summary — hidden when collapsed */}
      {!collapsed && (
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarSection} style={{ padding: 0, marginBottom: 8 }}>
            Validation
          </div>
          <div className={styles.validationItem}>
            <CheckCircle size={14} style={{ color: 'var(--s-success)', flexShrink: 0 }} />
            <span>{state.testcases.filter(t => t.validationStatus === 'valid').length} valid tests</span>
          </div>
          <div className={styles.validationItem}>
            <AlertTriangle size={14} style={{ color: 'var(--s-warning)', flexShrink: 0 }} />
            <span>{state.testcases.filter(t => t.validationStatus === 'pending').length} pending</span>
          </div>
          <div className={styles.validationItem}>
            <Code2 size={14} style={{ color: 'var(--s-accent)', flexShrink: 0 }} />
            <span>{state.solutions.length} solution(s)</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default StudioSidebar;
