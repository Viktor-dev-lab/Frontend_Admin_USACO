export interface SubmissionStatus {
  code: 'AC' | 'WA' | 'TLE' | 'MLE' | 'CE' | 'RE';
  label: string;
}

export interface IntegrityReport {
  flag: 'Safe' | 'Suspicious' | 'Plagiarized' | 'AI_Flagged' | 'Malware_Blocked';
  confidence?: number;
  reason?: string;
  similarToUser?: string;
  similarSubmissionId?: string;
  engine?: string; // For AI Flagged
  blockedAction?: string; // For Malware Blocked
  environment?: string; // For Malware Blocked
}

export interface Submission {
  id: string;
  timestamp: string;
  user: {
    username: string;
    avatarUrl?: string;
  };
  problem: {
    id: string;
    title: string;
  };
  status: SubmissionStatus;
  runtime: number; // ms
  memory: number; // MB
  language: string;
  code: string;
  testcasesPassed: number;
  totalTestcases: number;
  integrity: IntegrityReport;
}
