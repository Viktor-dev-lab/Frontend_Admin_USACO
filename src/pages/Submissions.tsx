import React, { useState } from 'react';
import styles from './Submissions.module.css';
import { 
  Search, ShieldAlert, Bot, Shield, Code2, Flag, ArrowUpRight, ArrowDownRight, TerminalSquare 
} from 'lucide-react';
import type { Submission } from '../types/submission';
import SubmissionTable from '../components/submissions/SubmissionTable';
import SubmissionDetailDrawer from '../components/submissions/SubmissionDetailDrawer';

// --- MOCK DATA --- 

// Malicious / AI Data mapped to Submission structures for the Drawer
const MOCK_THREAT_SUBMISSIONS: Record<string, Submission> = {
  'lazy_coder_ai': {
    id: "949100", timestamp: "5 mins ago", user: { username: "lazy_coder" },
    problem: { id: "P201", title: "Lifeguards" }, status: { code: "AC", label: "Accepted" },
    runtime: 11, memory: 4.1, language: "C++",
    code: "// AI Generated Solution\n#include <iostream>\n// ... perfect formatting ...",
    testcasesPassed: 10, totalTestcases: 10,
    integrity: { flag: 'AI_Flagged', confidence: 98, engine: 'GPT-4', reason: 'LLM generated AST signature detected.' }
  },
  'fast_fingers_ai': {
    id: "949098", timestamp: "2 hours ago", user: { username: "fast_fingers" },
    problem: { id: "P105", title: "Milk Pails" }, status: { code: "WA", label: "Wrong Answer" },
    runtime: 34, memory: 12.0, language: "Python",
    code: "def solve():\n    # Looks like Claude\n    pass",
    testcasesPassed: 5, totalTestcases: 12,
    integrity: { flag: 'AI_Flagged', confidence: 85, engine: 'Claude 3', reason: 'Stylometric analysis matches Claude 3 default outputs.' }
  },
  'hacker_1337_mal': {
    id: "949090", timestamp: "10 mins ago", user: { username: "hacker_1337" },
    problem: { id: "P001", title: "Two Sum Optimize" }, status: { code: "RE", label: "Runtime Error" },
    runtime: 0, memory: 0, language: "Python",
    code: "import os\nos.system('cat /etc/passwd')",
    testcasesPassed: 0, totalTestcases: 50,
    integrity: { flag: 'Malware_Blocked', blockedAction: 'File Read: /etc/passwd', environment: 'Isolate Sandbox', reason: 'Attempted to read sensitive system file.' }
  },
  'script_kiddie_mal': {
    id: "948000", timestamp: "1 day ago", user: { username: "script_kiddie" },
    problem: { id: "P002", title: "Add Two Numbers" }, status: { code: "RE", label: "Runtime Error" },
    runtime: 0, memory: 0, language: "Java",
    code: "import java.net.*;\npublic class Main {\n  public static void main(String[] a) throws Exception {\n    new Socket(\"10.0.0.1\", 8080);\n  }\n}",
    testcasesPassed: 0, totalTestcases: 10,
    integrity: { flag: 'Malware_Blocked', blockedAction: 'Outbound TCP: port 8080', environment: 'Docker Sandbox', reason: 'Attempted outbound arbitrary port connection.' }
  }
};

const MOCK_SUBMISSIONS: Submission[] = [
  ...Object.values(MOCK_THREAT_SUBMISSIONS),
  {
    id: "948210", timestamp: "2 mins ago", user: { username: "tourist_fan" },
    problem: { id: "P001", title: "Two Sum Optimize" }, status: { code: "AC", label: "Accepted" },
    runtime: 12, memory: 4.2, language: "C++",
    code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World\";\n    return 0;\n}",
    testcasesPassed: 50, totalTestcases: 50, integrity: { flag: "Safe" }
  },
  {
    id: "948208", timestamp: "1 hour ago", user: { username: "hacker_boy22" },
    problem: { id: "P001", title: "Two Sum Optimize" }, status: { code: "AC", label: "Accepted" },
    runtime: 11, memory: 4.3, language: "C++",
    code: "// Suspiciously similar code\n...",
    testcasesPassed: 50, totalTestcases: 50,
    integrity: { flag: "Plagiarized", confidence: 94, reason: "AST structure perfectly matches submission #948190.", similarToUser: "tourist_fan" }
  }
];

const Submissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntegrity, setFilterIntegrity] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const filteredSubmissions = MOCK_SUBMISSIONS.filter(sub => {
    const matchesSearch = sub.id.includes(searchTerm) || 
      sub.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesIntegrity = true;
    if (filterIntegrity === 'Clean') matchesIntegrity = sub.integrity.flag === 'Safe';
    else if (filterIntegrity === 'Flagged AI') matchesIntegrity = sub.integrity.flag === 'AI_Flagged';
    else if (filterIntegrity === 'Flagged Sandbox') matchesIntegrity = sub.integrity.flag === 'Malware_Blocked';
    else if (filterIntegrity === 'Plagiarized') matchesIntegrity = sub.integrity.flag === 'Plagiarized';

    return matchesSearch && matchesIntegrity;
  });

  return (
    <div className={`fade-in ${styles.pageContainer}`}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1>Submission & Platform Integrity</h1>
          <p>Monitor submissions, system load, and actively block platform security threats.</p>
        </div>
      </div>

      {/* ROW 1: Quick Metric Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><Bot size={14} color="#a855f7"/> AI Code Flags</div>
          <div className={styles.statValue} style={{ color: '#a855f7' }}>24</div>
          <div className={`${styles.statTrend} ${styles.trendUp}`}><ArrowUpRight size={14}/> 8% vs yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><Shield size={14} color="#ef4444"/> Malware Blocks</div>
          <div className={styles.statValue} style={{ color: '#ef4444' }}>2</div>
          <div className={`${styles.statTrend} ${styles.trendNeutral}`}><ArrowDownRight size={14}/> 0% vs yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><Code2 size={14} color="#f59e0b"/> Plagiarism Matches</div>
          <div className={styles.statValue}>15</div>
          <div className={`${styles.statTrend} ${styles.trendWarn}`}>Needs Review</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><Flag size={14} color="#3b82f6"/> Active Reports</div>
          <div className={styles.statValue}>7</div>
          <div className={`${styles.statTrend} ${styles.trendUp}`}>2 High Priority</div>
        </div>
      </div>

      {/* ROW 2: Active Threat Panels */}
      <div className={styles.dashboardGrid}>
        
        {/* Left Column: AI Alerts */}
        <div className={styles.panelCard}>
          <h3 className={styles.panelTitle}>
            <Bot size={20} color="#a855f7" /> AI Code Generation Alerts
          </h3>
          <p className={styles.panelDesc}>LLM heuristic detection catching copy-pasted ChatGPT/Claude solutions.</p>
          
          <div className={styles.threatList}>
            <div className={`${styles.threatItem} ${styles.threatAI}`}>
              <div className={styles.threatHeader}>
                <span className={styles.threatUser}>lazy_coder</span>
                <span className={styles.threatTime}>5 mins ago</span>
              </div>
              <div className={`${styles.threatMatch} ${styles.high}`}>98% AI Match</div>
              <div className={styles.threatDetails}>
                <span><Code2 size={12}/> Lifeguards</span> | Engine: <strong>GPT-4</strong>
              </div>
              <div className={styles.threatActions}>
                <button className={`${styles.btnSmall} ${styles.btnOutline}`} onClick={() => setSelectedSubmission(MOCK_THREAT_SUBMISSIONS['lazy_coder_ai'])}>Inspect Code</button>
                <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Disqualify</button>
              </div>
            </div>

            <div className={`${styles.threatItem} ${styles.threatAI}`}>
              <div className={styles.threatHeader}>
                <span className={styles.threatUser}>fast_fingers</span>
                <span className={styles.threatTime}>2 hours ago</span>
              </div>
              <div className={`${styles.threatMatch} ${styles.med}`}>85% AI Match</div>
              <div className={styles.threatDetails}>
                <span><Code2 size={12}/> Milk Pails</span> | Engine: <strong>Claude 3</strong>
              </div>
              <div className={styles.threatActions}>
                <button className={`${styles.btnSmall} ${styles.btnOutline}`} onClick={() => setSelectedSubmission(MOCK_THREAT_SUBMISSIONS['fast_fingers_ai'])}>Inspect Code</button>
                <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Disqualify</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Malware Alerts */}
        <div className={styles.panelCard}>
          <h3 className={styles.panelTitle}>
            <TerminalSquare size={20} color="#ef4444" /> Malicious Sandbox Activity
          </h3>
          <p className={styles.panelDesc}>Attempts to breach Judge Worker environments via arbitrary code execution.</p>
          
          <div className={styles.threatList}>
            <div className={`${styles.threatItem} ${styles.threatMalware}`}>
              <div className={styles.threatHeader}>
                <span className={styles.threatUser}>hacker_1337</span>
                <span className={styles.threatTime}>10 mins ago</span>
              </div>
              <div className={styles.threatLog}>[BLOCKED] File Read: /etc/passwd</div>
              <div className={styles.threatDetails}>
                Env: <strong>Isolate Sandbox</strong>
              </div>
              <div className={styles.threatActions}>
                <button className={`${styles.btnSmall} ${styles.btnOutline}`} onClick={() => setSelectedSubmission(MOCK_THREAT_SUBMISSIONS['hacker_1337_mal'])}>View Payload</button>
                <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Instant Permaban</button>
              </div>
            </div>

            <div className={`${styles.threatItem} ${styles.threatMalware}`}>
              <div className={styles.threatHeader}>
                <span className={styles.threatUser}>script_kiddie</span>
                <span className={styles.threatTime}>1 day ago</span>
              </div>
              <div className={styles.threatLog}>[BLOCKED] Outbound TCP: port 8080</div>
              <div className={styles.threatDetails}>
                Env: <strong>Docker Sandbox</strong>
              </div>
              <div className={styles.threatActions}>
                <button className={`${styles.btnSmall} ${styles.btnOutline}`} onClick={() => setSelectedSubmission(MOCK_THREAT_SUBMISSIONS['script_kiddie_mal'])}>View Payload</button>
                <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Instant Permaban</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card (History) */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-h)' }}>Submissions History</h2>
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px' }}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchFiltersContainer}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search ID, User, or Problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className={styles.filterSelect}>
              <option value="">All Status</option>
              <option value="AC">Accepted</option>
              <option value="WA">Wrong Answer</option>
              <option value="TLE">Time Limit Exceeded</option>
            </select>
            <select className={styles.filterSelect}>
              <option value="">All Languages</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <select 
              className={styles.filterSelect}
              value={filterIntegrity}
              onChange={(e) => setFilterIntegrity(e.target.value)}
            >
              <option value="">Integrity: All</option>
              <option value="Clean">Clean</option>
              <option value="Flagged AI">Flagged AI</option>
              <option value="Flagged Sandbox">Flagged Sandbox</option>
              <option value="Plagiarized">Plagiarized</option>
            </select>
          </div>
        </div>

        <SubmissionTable 
          submissions={filteredSubmissions} 
          onViewDetails={(sub) => setSelectedSubmission(sub)} 
        />
      </div>

      {/* Detail Drawer */}
      <SubmissionDetailDrawer 
        submission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
      />
    </div>
  );
};

export default Submissions;
