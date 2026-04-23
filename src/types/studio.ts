// Re-export for convenience
export type { ProblemContent, Example, Solution };

/* ─── Bunny Storage Types ────────────────────────── */
export interface StorageFile {
  ObjectName: string; // e.g., "1.in", "1.out"
  Length: number;     // File size in bytes
  LastChanged: string;
}

export interface TestcaseConfig {
  id: string;
  problem_id: number;
  order: number;
  points: number;
  is_sample: boolean;
  input_file_url: string;  // This is the filename on Bunny (e.g. "1.in")
  output_file_url: string; // This is the filename on Bunny (e.g. "1.out")
  subtask_id?: number | null;
}

/* ─── Problem Status ─────────────────────────────── */
export type ProblemStatus = 'draft' | 'under_preview' | 'ready' | 'archived' | 'deleted';

/* ─── Constraints ────────────────────────────────── */
export type ConstraintType = 'integer' | 'float' | 'string' | 'graph' | 'tree' | 'permutation';

export interface Constraint {
  id: string;
  variable: string;
  type: ConstraintType;
  min: string;
  max: string;
  description: string;
}

/* ─── Extended Testcase ──────────────────────────── */
export interface TestcaseExtended {
  id: string;
  index: number;
  type: 'manual' | 'generated';
  input: string;
  output: string;
  inputSize: number;
  outputSize: number;
  isHidden: boolean;
  isExample: boolean;
  points: number;
  group: string;
  validationStatus: 'valid' | 'invalid' | 'pending' | 'skipped';
  generatorMeta?: {
    seed: number;
    args: string[];
    generatorVersion: string;
  };
  solutionMeta?: {
    time: number;
    memory: number;
    verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
  };
}

/* ─── Checker ────────────────────────────────────── */
export type CheckerType = 'default_diff' | 'custom_checker';

export interface CheckerConfig {
  type: CheckerType;
  diffOptions: {
    ignoreTrailingWhitespace: boolean;
    ignoreTrailingNewlines: boolean;
    caseInsensitive: boolean;
  };
  customCode: string;
  customLanguage: string;
}

/* ─── Generation Pipeline ────────────────────────── */
export type GenerationStep =
  | 'idle'
  | 'compiling-generator'
  | 'compiling-validator'
  | 'compiling-solution'
  | 'generating'
  | 'validating'
  | 'computing-output'
  | 'complete'
  | 'error';

export interface GenerationLog {
  timestamp: string;
  testIndex: number;
  step: string;
  status: 'ok' | 'error' | 'info';
  message: string;
}

export interface GenerationState {
  step: GenerationStep;
  progress: number;
  total: number;
  logs: GenerationLog[];
  error: string | null;
}

/* ─── Studio Tabs ────────────────────────────────── */
export type StudioTab = 'general' | 'statement' | 'checker' | 'solutions' | 'testcases' | 'generator';

/* ─── Studio State ───────────────────────────────── */
export interface StudioState {
  problemId: string | null;
  meta: {
    title: string;
    slug: string;
    difficulty: number;
    external_id: string;
    original_url: string;
    platform_id: number | null;
    division_id: number | null;
    tags: number[];
    status: ProblemStatus;
    time_limit: number | null; // in seconds
    memory_limit: number | null; // in MB
  };
  statementEN: ProblemContent;
  statementVI: ProblemContent;
  constraints: Constraint[];
  generatorCode: string;
  generatorLanguage: string;
  validatorCode: string;
  validatorLanguage: string;
  checkerConfig: CheckerConfig;
  officialSolutionCode: string; // From problem_scripts
  solutions: Solution[]; // These are user-provided or multiple solutions
  testcases: TestcaseExtended[];
  storageFiles: StorageFile[]; // Files currently on Bunny Storage
  dbTestcases: TestcaseConfig[]; // Metadata from Database
  generation: GenerationState;
  activeTab: StudioTab;
  isDirty: boolean;
  lastSavedAt: string | null;
}

/* ─── Studio Actions ─────────────────────────────── */
export type StudioAction =
  | { type: 'INIT'; payload: StudioState }
  | { type: 'SET_META'; payload: Partial<StudioState['meta']> }
  | { type: 'SET_STATEMENT'; payload: { lang: 'en' | 'vi'; content: Partial<ProblemContent> } }
  | { type: 'SET_CONSTRAINTS'; payload: Constraint[] }
  | { type: 'SET_CODE'; payload: { target: 'generator' | 'validator' | 'checker' | 'solution'; code: string; language?: string } }
  | { type: 'SET_SOLUTIONS'; payload: Solution[] }
  | { type: 'SET_TESTCASES'; payload: TestcaseExtended[] }
  | { type: 'SET_STORAGE_FILES'; payload: StorageFile[] }
  | { type: 'SET_DB_TESTCASES'; payload: TestcaseConfig[] }
  | { type: 'ADD_TESTCASES'; payload: TestcaseExtended[] }
  | { type: 'REMOVE_TESTCASE'; payload: string }
  | { type: 'REORDER_TESTCASES'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'UPDATE_TESTCASE'; payload: { id: string; updates: Partial<TestcaseExtended> } }
  | { type: 'SET_CHECKER'; payload: Partial<CheckerConfig> }
  | { type: 'SET_GENERATION'; payload: Partial<GenerationState> }
  | { type: 'SET_ACTIVE_TAB'; payload: StudioTab }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_DIRTY' };

// Value export to ensure Vite treats this as a valid JS module
export const STUDIO_EMPTY = {};
