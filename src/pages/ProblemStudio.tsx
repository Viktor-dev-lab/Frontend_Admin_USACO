import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StudioProvider, useStudio, initialStudioState } from '../components/studio/StudioContext';
import StudioHeader from '../components/studio/StudioHeader';
import StudioSidebar from '../components/studio/StudioSidebar';
import StudioStatusBar from '../components/studio/StudioStatusBar';
import GeneralInfoPanel from '../components/studio/GeneralInfoPanel';
import StatementEditor from '../components/studio/StatementEditor';
import CheckerPanel from '../components/studio/CheckerPanel';
import SolutionPanel from '../components/studio/SolutionPanel';
import GeneratorPanel from '../components/studio/GeneratorPanel';
import TestcaseStudio from '../components/studio/TestcaseStudio';
import problemService from '../services/problemService';
import styles from './ProblemStudio.module.css';

/* ─── Content Router ─────────────────────────────── */
const StudioContent: React.FC = () => {
  const { state } = useStudio();

  switch (state.activeTab) {
    case 'general':
      return <GeneralInfoPanel />;
    case 'statement':
      return <StatementEditor />;
    case 'checker':
      return <CheckerPanel />;
    case 'solutions':
      return <SolutionPanel />;
    case 'testcases':
      return <TestcaseStudio />;
    case 'generator':
      return <GeneratorPanel />;
    default:
      return <GeneralInfoPanel />;
  }
};

/* ─── Unsaved Changes Guard ──────────────────────── */
const UnsavedGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useStudio();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.isDirty]);

  return <>{children}</>;
};

/* ─── Main Studio Page ───────────────────────────── */
const ProblemStudioInner: React.FC = () => {
  return (
    <UnsavedGuard>
      <div className={styles.studio}>
        <StudioHeader />
        <div className={styles.body}>
          <StudioSidebar />
          <main className={styles.content}>
            <StudioContent />
          </main>
        </div>
        <StudioStatusBar />
      </div>
    </UnsavedGuard>
  );
};

/* ─── Wrapped with Provider ──────────────────────── */
const ProblemStudioInnerWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { dispatch } = useStudio();

  useEffect(() => {
    if (id && id !== 'new') {
      const loadProblem = async () => {
        try {
          const [problem, scripts] = await Promise.all([
            problemService.getProblemById(id),
            problemService.getScripts(id)
          ]);
          
          // Map backend problem to StudioState
          const stateInit: any = {
            problemId: problem.id,
            meta: {
              title: problem.title || '',
              slug: problem.slug || '',
              difficulty: problem.difficulty || 800,
              external_id: problem.external_id || '',
              original_url: problem.original_url || '',
              platform_id: problem.platform_id ?? null,
              division_id: problem.division_id ?? null,
              // Use the new tag_ids field from the backend
              tags: Array.isArray((problem as any).tag_ids)
                ? (problem as any).tag_ids
                : (Array.isArray((problem as any).problem_tags)
                    ? (problem as any).problem_tags.map((pt: any) => pt.tag_id || pt.tags?.id).filter(Boolean)
                    : []),
              status: problem.status || 'draft',
              time_limit: problem.time_limit,
              memory_limit: problem.memory_limit,
            },
            statementEN: problem.content_en ? JSON.parse(problem.content_en) : undefined,
            statementVI: problem.content_vi ? JSON.parse(problem.content_vi) : undefined,
            solutions: problem.solutions || [],
            testcases: problem.testcases || [],
            checkerConfig: {
              type: problem.checker_type || 'default_diff',
              diffOptions: {
                ignoreTrailingWhitespace: true,
                ignoreTrailingNewlines: true,
                caseInsensitive: false,
              },
              customCode: scripts?.checker_code || '',
              customLanguage: 'cpp',
            },
            validatorCode: scripts?.validator_code || '',
            generatorCode: scripts?.generator_code || '',
            officialSolutionCode: scripts?.solution_code || '',
          };

          dispatch({ type: 'INIT', payload: { ...initialStudioState, ...stateInit } });
        } catch (err) {
          console.error('Failed to load problem', err);
          alert('Failed to load problem details.');
        }
      };
      loadProblem();
    }
  }, [id, dispatch]);

  return <ProblemStudioInner />;
};

const ProblemStudio: React.FC = () => {
  return (
    <StudioProvider>
      <ProblemStudioInnerWrapper />
    </StudioProvider>
  );
};

export default ProblemStudio;
