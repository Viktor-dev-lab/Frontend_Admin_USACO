export type Example = {
  input: string;
  output: string;
}

export type ProblemContent = {
  time_limit: string;
  memory_limit: string;
  description: string;
  input_format: string;
  output_format: string;
  examples: Example[];
  note: string;
}

export type Testcase = {
  id: string;
  input: string;
  output: string;
  isHidden: boolean;
  isExample?: boolean;
}

export type Solution = {
  id: string;
  language: string;
  code: string;
  explanation: string; // Markdown explanation
}

export type ProblemStatus = 'draft' | 'under_preview' | 'ready' | 'archived' | 'deleted';

export type CheckerType = 'default_diff' | 'custom_checker';

export interface ProblemScripts {
  id?: string;
  problem_id?: string;
  checker_code?: string;
  validator_code?: string;
  generator_code?: string;
  solution_code?: string;
}

export type Problem = {
  id: string;
  external_id: string;
  platform_id: number;
  division_id: number;
  slug: string;
  title: string;
  difficulty: number;
  original_url: string;
  content_en: string; // Serialized ProblemContent JSON
  content_vi: string; // Serialized ProblemContent JSON
  status: ProblemStatus;
  time_limit: number | null;
  memory_limit: number | null;
  bookmark_count: number;
  acceptance_rate: number;
  view_count: number | null;
  checker_type: CheckerType;
  platform?: { id: number; name: string; slug: string };
  division?: { id: number; name: string; slug: string };
  platforms?: string; // Support for direct string names from backend
  divisions?: string; // Support for direct string names from backend
  tags: ({ id: number; name: string; slug: string } | string)[];
  testcases?: Testcase[];
  solutions?: Solution[];
  scripts?: ProblemScripts;
}

export interface ProblemResponse {
  data: Problem[];
  paging: {
    page: number;
    limit: number;
    total: number;
  };
}

export type CreateProblemInput = {
  external_id: string;
  platform_id: number;
  division_id: number;
  slug: string;
  title: string;
  difficulty: number;
  time_limit: number | null;
  memory_limit: number | null;
  status: ProblemStatus;
  original_url: string;
  content_en: string;
  content_vi: string;
  tags: number[];
  checker_type?: CheckerType;
};

export type UpdateProblemInput = Partial<CreateProblemInput>;

export interface ProblemFilterDTO {
  platform_id?: number | string; // Handle string for dropdown compatibility
  difficulty?: number | string;
  slug?: string;
  status?: string;
}

// Value export to ensure Vite treats this as a valid JS module
export const PROBLEM_EMPTY = {};
