import React, { useState, useEffect } from 'react';
import styles from './Problems.module.css';
import { Plus, Database, RefreshCw, AlertCircle, List, Tag as TagIcon, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProblemTable from '../components/problems/ProblemTable';
import TagManager from '../components/problems/TagManager';
import PlatformManager from '../components/problems/PlatformManager';
import problemService from '../services/problemService';
import { type Problem } from '../types/problem';

// Mock data based on the provided JSON for initial development/demo
const MOCK_PROBLEMS: Problem[] = [
  {
    id: "9",
    external_id: "2211B",
    slug: "mickey-mouse-constructive",
    title: "Mickey Mouse Constructive",
    difficulty: 1200,
    original_url: "https://codeforces.com/problemset/problem/2211/B",
    content_en: "{\n  \"time_limit\": \"1.5 seconds\",\n  \"memory_limit\": \"256 megabytes\",\n  \"description\": \"Given an array $a$, let $f(a)$ be the number of ways to partition $a$ into one or more subarrays$^{\\\\text{∗}}$ such that: Each element appears in exactly one subarray. All subarrays have the same sum. For example, if $a=[1,1]$, then $f(a)=2$, because there are two such ways to partition $[1,1]$: $[1,1]$, where the only subarray has sum $2$. $[1]+[1]$, where both subarrays have sum $1$. You are given two integers $x$ and $y$. Find the minimum value of $f(a)$ over all arrays $a$ of length $x+y$, consisting of $x$ copies of the number $1$, and $y$ copies of the number $-1$ in some order. Since this answer may be large, output the answer modulo $676\\\\,767\\\\,677$. Additionally, you should construct one array that achieves this minimal value. $^{\\\\text{∗}}$An array $b$ is a subarray of an array $c$ if $b$ can be obtained from $c$ by the deletion of several (possibly, zero or all) elements from the beginning and several (possibly, zero or all) elements from the end.\",\n  \"input_format\": \"Each test contains multiple test cases. The first line contains the number of test cases $t$ ($1 \\\\le t \\\\le 10^4$). The description of the test cases follows. The first line of each test case contains two integers $x$ and $y$ ($0 \\\\leq x,y \\\\leq 2\\\\cdot 10^5$). It is guaranteed that $x+y \\\\geq 1$. It is guaranteed that the sum of $x$ over all test cases does not exceed $2\\\\cdot 10^5$, and the sum of $y$ over all test cases does not exceed $2\\\\cdot 10^5$.\",\n  \"output_format\": \"For each test case, output two lines: the minimum value of $f(a)$ over all valid arrays $a$ modulo $676\\\\,767\\\\,677$, and an example of an array that achieves the minimal result. Note you are minimizing $f(a)$, and taking that minimum value modulo $676\\\\,767\\\\,677$, not finding the minimal possible result of $f(a)$ mod $676\\\\,767\\\\,677$.\",\n  \"examples\": [\n    {\n      \"input\": \"2 0\",\n      \"output\": \"2\\n1 1\"\n    },\n    {\n      \"input\": \"1 1\",\n      \"output\": \"1\\n1 -1\"\n    },\n    {\n      \"input\": \"6 7\",\n      \"output\": \"1\\n-1 1 -1 1 -1 1 -1 1 -1 1 -1 1 -1\"\n    },\n    {\n      \"input\": \"1 3\",\n      \"output\": \"2\\n-1 -1 -1 1\"\n    }\n  ],\n  \"note\": \"In the first test case, $x=2$ and $y=0$. The only possible array is $a=[1,1]$, with $f(a)=2$ as explained above. In the second case, $x=1$ and $y=1$. One possible array that minimizes $f(a)$ is $a=[1,-1]$, where $f(a)=1$ (as the only way to partition into subarrays with all subarrays having equal sum is $[[1,-1]]$).\"\n}",
    content_vi: "{\n  \"time_limit\": \"1.5 giây\",\n  \"memory_limit\": \"256 megabyte\",\n  \"description\": \"Cho một mảng $a$, gọi $f(a)$ là số cách để chia mảng $a$ thành một hoặc nhiều mảng con$^{\\\\text{∗}}$ sao cho: Mỗi phần tử xuất hiện trong đúng một mảng con. Tất cả các mảng con có tổng bằng nhau. Ví dụ, nếu $a=[1,1]$, thì $f(a)=2$, bởi vì có hai cách để chia $[1,1]$: $[1,1]$, trong đó mảng con duy nhất có tổng là $2$. $[1]+[1]$, trong đó cả hai mảng con có tổng là $1$. Bạn được cho hai số nguyên $x$ và $y$. Tìm giá trị nhỏ nhất của $f(a)$ trên tất cả các mảng $a$ có độ dài $x+y$, bao gồm $x$ bản sao của số $1$ và $y$ bản sao của số $-1$ theo một thứ tự nào đó. Vì câu trả lời này có thể lớn, hãy xuất kết quả modulo $676\\\\,767\\\\,677$. Ngoài ra, bạn phải xây dựng một mảng đạt được giá trị nhỏ nhất này. $^{\\\\text{∗}}$Một mảng $b$ là mảng con của mảng $c$ nếu $b$ có thể thu được từ $c$ bằng cách xóa một số (có thể là không hoặc tất cả) phần tử từ đầu và một số (có thể là không hoặc tất cả) phần tử từ cuối.\",\n  \"input_format\": \"Mỗi bài kiểm tra chứa nhiều trường hợp thử nghiệm. Dòng đầu tiên chứa số lượng trường hợp thử nghiệm $t$ ($1 \\\\le t \\\\le 10^4$). Mô tả các trường hợp thử nghiệm như sau. Dòng đầu tiên của mỗi trường hợp thử nghiệm chứa hai số nguyên $x$ và $y$ ($0 \\\\leq x,y \\\\leq 2\\\\cdot 10^5$). Đảm bảo rằng $x+y \\\\geq 1$. Đảm bảo rằng tổng của $x$ trên tất cả các trường hợp thử nghiệm không vượt quá $2\\\\cdot 10^5$, và tổng của $y$ trên tất cả các trường hợp thử nghiệm không vượt quá $2\\\\cdot 10^5$.\",\n  \"output_format\": \"Đối với mỗi trường hợp thử nghiệm, xuất hai dòng: giá trị nhỏ nhất của $f(a)$ trên tất cả các mảng $a$ hợp lệ modulo $676\\\\,767\\\\,677$, và một ví dụ về một mảng đạt được kết quả nhỏ nhất. Lưu ý bạn đang cực tiểu hóa $f(a)$, và lấy giá trị cực tiểu đó theo modulo $676\\\\,767\\\\,677$, chứ không phải tìm kết quả nhỏ nhất có thể của $f(a)$ mod $676\\\\,767\\\\,677$.\",\n  \"examples\": [\n    {\n      \"input\": \"2 0\",\n      \"output\": \"2\\n1 1\"\n    },\n    {\n      \"input\": \"1 1\",\n      \"output\": \"1\\n1 -1\"\n    },\n    {\n      \"input\": \"6 7\",\n      \"output\": \"1\\n-1 1 -1 1 -1 1 -1 1 -1 1 -1 1 -1\"\n    },\n    {\n      \"input\": \"1 3\",\n      \"output\": \"2\\n-1 -1 -1 1\"\n    }\n  ],\n  \"note\": \"Trong trường hợp thử nghiệm đầu tiên, $x=2$ và $y=0$. Mảng duy nhất có thể là $a=[1,1]$, với $f(a)=2$ như đã giải thích ở trên. Trong trường hợp thứ hai, $x=1$ và $y=1$. Một mảng có thể làm giảm thiểu $f(a)$ là $a=[1,-1]$, trong đó $f(a)=1$ (vì cách duy nhất để chia thành các mảng con có tổng bằng nhau là $[[1,-1]]$).\"\n}",
    bookmark_count: 0,
    acceptance_rate: 0,
    view_count: null,
    platforms: "Codeforces",
    divisions: "Specialist",
    tags: [
      { id: 1, name: "dp", slug: "dp" },
      { id: 2, name: "constructive algorithms", slug: "constructive-algorithms" },
      { id: 3, name: "math", slug: "math" },
      { id: 4, name: "greedy", slug: "greedy" }
    ],
    testcases: [
      { id: "tc1", input: "2 0", output: "2\n1 1", isHidden: false },
      { id: "tc2", input: "10 5", output: "32\n1 2 3", isHidden: true }
    ],
    solutions: [
      { id: "sol1", language: "cpp", code: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  return 0;\n}", explanation: "This is a simple greedy approach." }
    ]
  }
];
import platformService from '../services/platformService';
import type { Platform } from '../types/platform';
import { Search as SearchIcon, Filter, X } from 'lucide-react';

const Problems = () => {
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'tags' | 'platforms'>('problems');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters State
  const [filters, setFilters] = useState({
    platform_id: '',
    difficulty: '',
    status: '',
    slug: '' // Used as search term
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const navigate = useNavigate();

  const fetchPlatforms = async () => {
    try {
      const response = await platformService.getPlatforms();
      setPlatforms(response.data);
    } catch (err) {
      console.error("Failed to fetch platforms", err);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map empty strings to undefined for cleaner API query
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await problemService.getProblems(page, limit, cleanFilters);
      setProblems(response.data);
      setTotal(response.paging.total);
    } catch (err: any) {
      console.warn("API not available, using mock data", err);
      setProblems(MOCK_PROBLEMS);
      setTotal(MOCK_PROBLEMS.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (activeTab === 'problems') {
      fetchProblems();
    }
  }, [activeTab, page, limit, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({ platform_id: '', difficulty: '', status: '', slug: '' });
    setPage(1);
  };

  const handleCreate = () => {
    navigate('/problems/new/studio');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await problemService.deleteProblem(id);
      fetchProblems();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className={`fade-in ${styles.pageContainer}`}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1>Problems Bank</h1>
        </div>
        <div className={styles.actionsSection}>
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tab} ${activeTab === 'problems' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('problems')}
            >
              <List size={18} /> Problems
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'tags' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tags')}
            >
              <TagIcon size={18} /> Tags
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'platforms' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('platforms')}
            >
              <Globe size={18} /> Platforms
            </button>
          </div>
          
          {activeTab === 'problems' && (
            <>
              <button onClick={fetchProblems} className={styles.btnOutline} disabled={loading}>
                <RefreshCw size={18} className={loading ? 'spin' : ''} />
              </button>
              <button onClick={handleCreate} className={`${styles.btn} ${styles.btnPrimary}`}>
                <Plus size={18} /> New Problem
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'problems' && (
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div className={styles.searchBox}>
              <SearchIcon className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search Title or Slug..."
                value={filters.slug}
                onChange={(e) => handleFilterChange('slug', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <select 
              value={filters.platform_id} 
              onChange={(e) => handleFilterChange('platform_id', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Platforms</option>
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="under_preview">Preview</option>
              <option value="archived">Archived</option>
            </select>

            <div className={styles.difficultyInput}>
              <span>Diff:</span>
              <input 
                type="number" 
                placeholder="Ex: 1500"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              />
            </div>

            {(filters.platform_id || filters.difficulty || filters.status || filters.slug) && (
              <button className={styles.btnClearFilters} onClick={clearFilters} title="Clear Filters">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'problems' && (
        loading && problems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <RefreshCw size={40} className="spin" style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <p style={{ marginTop: '16px', color: 'var(--text)' }}>Loading problems bank...</p>
          </div>
        ) : (
          <ProblemTable 
            problems={problems} 
            onDelete={handleDelete} 
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )
      )}

      {activeTab === 'tags' && <TagManager />}
      {activeTab === 'platforms' && <PlatformManager />}

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontSize: '0.85rem' }}>
        <Database size={14} />
        <span>Connected to Admin API: <strong>{total} problems</strong> in database {Object.values(filters).some(v => v !== '') && '(Filtered)'}.</span>
      </div>
    </div>
  );
};

export default Problems;
