import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { StudioState, StudioAction, ProblemContent } from '../../types/studio';

/* ─── Default Content ────────────────────────────── */
const DEFAULT_CONTENT: ProblemContent = {
  time_limit: '1.5 seconds',
  memory_limit: '256 megabytes',
  description: '',
  input_format: '',
  output_format: '',
  examples: [{ input: '', output: '' }],
  note: ''
};

/* ─── Initial State ──────────────────────────────── */
export const initialStudioState: StudioState = {
  problemId: null,
  meta: {
    title: '',
    slug: '',
    difficulty: 800,
    external_id: '',
    original_url: '',
    platform_id: null,
    division_id: null,
    tags: [],
    status: 'draft',
    time_limit: 1.5,
    memory_limit: 256,
    checker_type: 'default_diff',
  },
  statementEN: { ...DEFAULT_CONTENT },
  statementVI: { ...DEFAULT_CONTENT },
  constraints: [],
  generatorCode: `#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    // registerGen(argc, argv, 1);
    int seed = atoi(argv[1]);
    mt19937 rng(seed);

    int n = rng() % 100000 + 1;
    cout << n << "\\n";
    for (int i = 0; i < n; i++) {
        cout << (int)(rng() % 2000000001 - 1000000000);
        if (i < n - 1) cout << " ";
    }
    cout << "\\n";
    return 0;
}`,
  generatorLanguage: 'cpp',
  validatorCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n < 1 || n > 100000) {
        cerr << "Invalid n" << endl;
        return 1;
    }
    for (int i = 0; i < n; i++) {
        int x;
        if (!(cin >> x) || x < -1000000000 || x > 1000000000) {
            cerr << "Invalid a[" << i << "]" << endl;
            return 1;
        }
    }
    return 0;
}`,
  validatorLanguage: 'cpp',
  checkerConfig: {
    type: 'default_diff',
    diffOptions: {
      ignoreTrailingWhitespace: true,
      ignoreTrailingNewlines: true,
      caseInsensitive: false,
    },
    customCode: '',
    customLanguage: 'cpp',
  },
  officialSolutionCode: '',
  solutions: [],
  testcases: [],
  storageFiles: [],
  dbTestcases: [],
  generation: {
    step: 'idle',
    progress: 0,
    total: 0,
    logs: [],
    error: null,
  },
  activeTab: 'general',
  isDirty: false,
  lastSavedAt: null,
};

/* ─── Reducer ────────────────────────────────────── */
function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'INIT':
      return { ...action.payload, isDirty: false };

    case 'SET_META':
      return { ...state, meta: { ...state.meta, ...action.payload }, isDirty: true };

    case 'SET_STATEMENT': {
      const key = action.payload.lang === 'en' ? 'statementEN' : 'statementVI';
      return { ...state, [key]: { ...state[key], ...action.payload.content }, isDirty: true };
    }

    case 'SET_CONSTRAINTS':
      return { ...state, constraints: action.payload, isDirty: true };

    case 'SET_CODE': {
      const { target, code, language } = action.payload;
      const updates: any = { isDirty: true };
      if (target === 'generator') {
        updates.generatorCode = code;
        if (language) updates.generatorLanguage = language;
      } else if (target === 'validator') {
        updates.validatorCode = code;
        if (language) updates.validatorLanguage = language;
      } else if (target === 'checker') {
        updates.checkerConfig = { ...state.checkerConfig, customCode: code };
        if (language) updates.checkerConfig = { ...updates.checkerConfig, customLanguage: language };
      } else if (target === 'solution') {
        updates.officialSolutionCode = code;
      }
      return { ...state, ...updates };
    }

    case 'SET_SOLUTIONS':
      return { ...state, solutions: action.payload, isDirty: true };

    case 'SET_TESTCASES':
      return { ...state, testcases: action.payload, isDirty: true };

    case 'SET_STORAGE_FILES':
      return { ...state, storageFiles: action.payload };

    case 'SET_DB_TESTCASES':
      return { ...state, dbTestcases: action.payload };

    case 'ADD_TESTCASES':
      return {
        ...state,
        testcases: [...state.testcases, ...action.payload],
        isDirty: true,
      };

    case 'REMOVE_TESTCASE':
      return {
        ...state,
        testcases: state.testcases
          .filter(tc => tc.id !== action.payload)
          .map((tc, i) => ({ ...tc, index: i })),
        isDirty: true,
      };

    case 'UPDATE_TESTCASE':
      return {
        ...state,
        testcases: state.testcases.map(tc =>
          tc.id === action.payload.id ? { ...tc, ...action.payload.updates } : tc
        ),
        isDirty: true,
      };

    case 'REORDER_TESTCASES': {
      const { fromIndex, toIndex } = action.payload;
      const newTestcases = [...state.testcases];
      const [moved] = newTestcases.splice(fromIndex, 1);
      newTestcases.splice(toIndex, 0, moved);
      return {
        ...state,
        testcases: newTestcases.map((tc, i) => ({ ...tc, index: i })),
        isDirty: true,
      };
    }

    case 'SET_CHECKER':
      return { ...state, checkerConfig: { ...state.checkerConfig, ...action.payload }, isDirty: true };

    case 'SET_GENERATION':
      return { ...state, generation: { ...state.generation, ...action.payload } };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'MARK_SAVED':
      return { ...state, isDirty: false, lastSavedAt: new Date().toISOString() };

    case 'MARK_DIRTY':
      return { ...state, isDirty: true };

    default:
      return state;
  }
}

/* ─── Context ────────────────────────────────────── */
interface StudioContextValue {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}

/* ─── Provider ───────────────────────────────────── */
export const StudioProvider: React.FC<{ children: React.ReactNode; initialState?: Partial<StudioState> }> = ({
  children,
  initialState,
}) => {
  const [state, dispatch] = useReducer(
    studioReducer,
    initialState ? { ...initialStudioState, ...initialState } : initialStudioState
  );

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
};

export default StudioContext;
